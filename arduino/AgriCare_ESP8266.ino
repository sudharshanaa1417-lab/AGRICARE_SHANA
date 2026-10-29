/*
 * =====================================================================
 *  PROJECT: AGRICARE - SMART AGRICULTURE IoT NODE
 *  ESP8266 NodeMCU Firmware for Cloud Telemetry & Automated Irrigation
 * =====================================================================
 *  Target Board: NodeMCU ESP8266 (ESP-12E Module)
 *  Hardware Sensors:
 *    - Capacitive / Resistive Soil Moisture Sensor (Analog A0)
 *    - DHT22 Temperature & Humidity Sensor (Digital D2)
 *    - 3-in-1 Soil NPK Sensor (RS485 Modbus RTU via MAX485 on D7/D1/D0)
 *    - SG90 / MG996R Servos for Water Valve (D5) and Medicine Valve (D6)
 *
 *  Cloud Endpoint:
 *    - Deployed Backend on Render: https://YOUR-APP-NAME.onrender.com
 *    - Ingestion API: POST /api/readings
 *    - Command Polling API: GET /api/command?device_id=esp8266-01
 *    - Security Header: X-API-Key: YOUR_RENDER_API_KEY
 * =====================================================================
 */

#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <WiFiClientSecureBearSSL.h>
#include <ArduinoJson.h>
#include <DHT.h>
#include <Servo.h>
#include <SoftwareSerial.h>

// =====================================================
// 1. WIFI AND RENDER SETTINGS - CHANGE THESE BEFORE FLASHING
// =====================================================
const char* WIFI_SSID     = "YOUR_WIFI_NAME";        // Enter your local 2.4GHz WiFi SSID
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";    // Enter your WiFi Password

// Render Cloud URL (No trailing slash)
const char* RENDER_URL    = "https://YOUR-APP-NAME.onrender.com";

// Security API Key configured in your Render Backend environment variables (DEVICE_API_KEY)
const char* API_KEY       = "YOUR_RENDER_API_KEY";

const char* DEVICE_ID     = "esp8266-01";

// =====================================================
// 2. NODEMCU ESP8266 PIN CONFIGURATION
// =====================================================
#define SOIL_PIN            A0   // Analog pin for soil moisture
#define DHT_PIN             D2   // GPIO4 for DHT22
#define DHT_TYPE            DHT22

#define WATER_SERVO_PIN     D5   // GPIO14 - Servo 1 (Water Valve)
#define MEDICINE_SERVO_PIN  D6   // GPIO12 - Servo 2 (Fertilizer/Medicine Valve)

#define RS485_RX_PIN        D7   // GPIO13 - Connect to MAX485 RO
#define RS485_TX_PIN        D1   // GPIO5  - Connect to MAX485 DI
#define RS485_DE_RE_PIN     D0   // GPIO16 - Connect to MAX485 DE & RE (shorted together)

// =====================================================
// 3. SOIL MOISTURE CALIBRATION
// =====================================================
// Measure raw analog readings in completely dry soil (in air) vs saturated wet soil
const int SOIL_DRY_RAW          = 800;
const int SOIL_WET_RAW          = 350;

const int WATER_ON_BELOW_PERCENT = 30; // Auto-watering triggers below 30%
const int WATER_REARM_PERCENT    = 40; // Auto-watering re-arms only after reaching 40%

// =====================================================
// 4. VALVE TIMINGS AND SERVO ANGLES
// =====================================================
const unsigned long WATER_ON_TIME    = 5000UL;   // 5 seconds watering pulse
const unsigned long WATER_COOLDOWN   = 60000UL;  // 60 seconds mandatory cooldown between cycles
const unsigned long MEDICINE_ON_TIME = 3000UL;   // 3 seconds medicine dosing pulse

const int WATER_CLOSED_ANGLE         = 0;
const int WATER_OPEN_ANGLE           = 90;

const int MEDICINE_CLOSED_ANGLE      = 0;
const int MEDICINE_OPEN_ANGLE        = 90;

// =====================================================
// 5. RS485 MODBUS NPK SENSOR SETTINGS
// =====================================================
const uint8_t  NPK_SLAVE_ID = 1;
const unsigned long NPK_BAUD = 9600;

// Modbus Holding Registers (Verify with sensor manufacturer datasheet)
const uint16_t NPK_REG_N    = 0x001E; // Nitrogen (mg/kg)
const uint16_t NPK_REG_P    = 0x001F; // Phosphorus (mg/kg)
const uint16_t NPK_REG_K    = 0x0020; // Potassium (mg/kg)

// =====================================================
// 6. OBJECTS AND SYSTEM VARIABLES
// =====================================================
DHT dht(DHT_PIN, DHT_TYPE);
Servo waterServo;
Servo medicineServo;
SoftwareSerial npkSerial(RS485_RX_PIN, RS485_TX_PIN);

int soilRaw           = 0;
int moisturePercent   = 0;

float temperatureC    = NAN;
float humidityPercent = NAN;

int nitrogen   = -1;
int phosphorus = -1;
int potassium  = -1;

bool waterOpen       = false;
bool medicineOpen    = false;
bool autoWater       = true;
bool autoWaterArmed  = true;

unsigned long waterStartedAt   = 0;
unsigned long medicineStartedAt= 0;
unsigned long lastWaterEndedAt = 0;

unsigned long lastSoilMs    = 0;
unsigned long lastDhtMs     = 0;
unsigned long lastNpkMs     = 0;
unsigned long lastUploadMs  = 0;
unsigned long lastCommandMs = 0;
unsigned long lastWifiMs    = 0;

// =====================================================
// 7. VALVE CONTROLLER FUNCTIONS
// =====================================================
void setWater(bool open) {
  if (open && !waterOpen) {
    waterStartedAt = millis();
    Serial.println(F("[AgriCare IoT] >> WATER VALVE OPENED (ON)"));
  }

  if (!open && waterOpen) {
    lastWaterEndedAt = millis();
    Serial.println(F("[AgriCare IoT] >> WATER VALVE CLOSED (OFF)"));
  }

  waterOpen = open;
  waterServo.write(open ? WATER_OPEN_ANGLE : WATER_CLOSED_ANGLE);
}

void setMedicine(bool open) {
  if (open && !medicineOpen) {
    medicineStartedAt = millis();
    Serial.println(F("[AgriCare IoT] >> MEDICINE VALVE OPENED (ON)"));
  }

  if (!open && medicineOpen) {
    Serial.println(F("[AgriCare IoT] >> MEDICINE VALVE CLOSED (OFF)"));
  }

  medicineOpen = open;
  medicineServo.write(open ? MEDICINE_OPEN_ANGLE : MEDICINE_CLOSED_ANGLE);
}

// =====================================================
// 8. MOISTURE RAW VALUE CONVERTER
// =====================================================
int moistureToPercent(int raw) {
  if (SOIL_DRY_RAW == SOIL_WET_RAW) {
    return 0;
  }
  long percent = (long)(SOIL_DRY_RAW - raw) * 100L / (long)(SOIL_DRY_RAW - SOIL_WET_RAW);
  return constrain((int)percent, 0, 100);
}

// =====================================================
// 9. MODBUS CRC-16 CALCULATION
// =====================================================
uint16_t modbusCRC(const uint8_t* data, uint8_t len) {
  uint16_t crc = 0xFFFF;
  for (uint8_t i = 0; i < len; i++) {
    crc ^= data[i];
    for (uint8_t j = 0; j < 8; j++) {
      if (crc & 1) {
        crc = (crc >> 1) ^ 0xA001;
      } else {
        crc >>= 1;
      }
    }
  }
  return crc;
}

// =====================================================
// 10. READ ONE NPK MODBUS REGISTER
// =====================================================
int readNpkRegister(uint16_t reg) {
  uint8_t requestFrame[8] = {
    NPK_SLAVE_ID,
    0x03,
    (uint8_t)(reg >> 8),
    (uint8_t)reg,
    0x00,
    0x01,
    0x00,
    0x00
  };

  uint16_t crc = modbusCRC(requestFrame, 6);
  requestFrame[6] = crc & 0xFF;
  requestFrame[7] = crc >> 8;

  while (npkSerial.available()) {
    npkSerial.read();
  }

  // Enable RS485 transmission
  digitalWrite(RS485_DE_RE_PIN, HIGH);
  delay(3);

  npkSerial.write(requestFrame, sizeof(requestFrame));
  npkSerial.flush();
  delay(3);

  // Enable RS485 reception
  digitalWrite(RS485_DE_RE_PIN, LOW);

  uint8_t response[7];
  uint8_t count = 0;
  unsigned long start = millis();

  while (millis() - start < 300 && count < 7) {
    if (npkSerial.available()) {
      response[count++] = npkSerial.read();
    }
    yield();
  }

  if (count != 7) return -1;
  if (response[0] != NPK_SLAVE_ID) return -1;
  if (response[1] != 0x03) return -1;
  if (response[2] != 2) return -1;

  uint16_t receivedCRC = (uint16_t)response[5] | ((uint16_t)response[6] << 8);
  if (modbusCRC(response, 5) != receivedCRC) {
    return -1;
  }

  return ((int)response[3] << 8) | response[4];
}

// =====================================================
// 11. READ SENSORS AND AUTOMATED IRRIGATION LOGIC
// =====================================================
void readSensors() {
  unsigned long now = millis();

  // Soil moisture: every 1000 ms
  if (now - lastSoilMs >= 1000) {
    lastSoilMs = now;
    soilRaw = analogRead(SOIL_PIN);
    moisturePercent = moistureToPercent(soilRaw);

    Serial.print(F("[Sensor] Soil Raw: "));
    Serial.print(soilRaw);
    Serial.print(F(" | Moisture: "));
    Serial.print(moisturePercent);
    Serial.println(F("%"));

    // Re-arm only when soil reaches wet threshold
    if (moisturePercent >= WATER_REARM_PERCENT) {
      autoWaterArmed = true;
    }

    // Trigger auto-watering pulse when soil is dry and cooldown has passed
    if (autoWater && autoWaterArmed && !waterOpen &&
        moisturePercent < WATER_ON_BELOW_PERCENT &&
        (now - lastWaterEndedAt >= WATER_COOLDOWN)) {
      autoWaterArmed = false;
      Serial.println(F("[Auto-Water] Moisture below threshold! Triggering water pulse."));
      setWater(true);
    }
  }

  // Safety auto-shutoff: close water valve after WATER_ON_TIME
  if (waterOpen && (now - waterStartedAt >= WATER_ON_TIME)) {
    setWater(false);
  }

  // DHT22 reading: every 2500 ms
  if (now - lastDhtMs >= 2500) {
    lastDhtMs = now;
    float h = dht.readHumidity();
    float t = dht.readTemperature();

    if (!isnan(h)) humidityPercent = h;
    if (!isnan(t)) temperatureC = t;

    Serial.print(F("[Sensor] Temp: "));
    Serial.print(temperatureC);
    Serial.print(F(" °C | Humidity: "));
    Serial.print(humidityPercent);
    Serial.println(F("%"));
  }

  // NPK Sensor reading: every 10,000 ms
  if (now - lastNpkMs >= 10000) {
    lastNpkMs = now;
    nitrogen   = readNpkRegister(NPK_REG_N);
    phosphorus = readNpkRegister(NPK_REG_P);
    potassium  = readNpkRegister(NPK_REG_K);

    Serial.print(F("[Sensor] NPK -> N: "));
    Serial.print(nitrogen);
    Serial.print(F(" mg/kg | P: "));
    Serial.print(phosphorus);
    Serial.print(F(" mg/kg | K: "));
    Serial.print(potassium);
    Serial.println(F(" mg/kg"));
  }

  // Safety auto-shutoff: close medicine valve after MEDICINE_ON_TIME
  if (medicineOpen && (now - medicineStartedAt >= MEDICINE_ON_TIME)) {
    setMedicine(false);
  }
}

// =====================================================
// 12. SERIALIZE TELEMETRY PAYLOAD
// =====================================================
String buildPayload() {
  StaticJsonDocument<512> doc;

  doc["device_id"] = DEVICE_ID;
  doc["soil_raw"]  = soilRaw;
  doc["moisture"]  = moisturePercent;

  if (isnan(temperatureC)) {
    doc["temperature"] = nullptr;
  } else {
    doc["temperature"] = temperatureC;
  }

  if (isnan(humidityPercent)) {
    doc["humidity"] = nullptr;
  } else {
    doc["humidity"] = humidityPercent;
  }

  doc["nitrogen"]   = nitrogen;
  doc["phosphorus"] = phosphorus;
  doc["potassium"]  = potassium;

  doc["water_open"]    = waterOpen;
  doc["medicine_open"] = medicineOpen;
  doc["auto_water"]    = autoWater;

  String payload;
  serializeJson(doc, payload);
  return payload;
}

// =====================================================
// 13. TRANSMIT DATA TO RENDER CLOUD
// =====================================================
bool sendRequest(const String& path, const String& body, bool isPost) {
  if (WiFi.status() != WL_CONNECTED) {
    return false;
  }

  BearSSL::WiFiClientSecure client;
  client.setInsecure(); // SSL certificate verification bypass for simplicity

  HTTPClient http;
  String url = String(RENDER_URL) + path;

  if (!http.begin(client, url)) {
    Serial.println(F("[HTTP] Failed to connect to Render"));
    return false;
  }

  http.addHeader("X-API-Key", API_KEY);
  int code;

  if (isPost) {
    http.addHeader("Content-Type", "application/json");
    code = http.POST(body);
  } else {
    code = http.GET();
  }

  Serial.print(F("[HTTP Status] "));
  Serial.print(url);
  Serial.print(F(" -> Response Code: "));
  Serial.println(code);

  http.end();
  return (code >= 200 && code < 300);
}

void uploadTelemetry() {
  sendRequest("/api/readings", buildPayload(), true);
}

// =====================================================
// 14. POLL CLOUD COMMANDS FROM RENDER BACKEND
// =====================================================
void pollCommands() {
  if (WiFi.status() != WL_CONNECTED) {
    return;
  }

  BearSSL::WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;
  String url = String(RENDER_URL) + "/api/command?device_id=" + String(DEVICE_ID);

  if (!http.begin(client, url)) {
    return;
  }

  http.addHeader("X-API-Key", API_KEY);
  int code = http.GET();

  if (code == HTTP_CODE_OK) {
    String responseBody = http.getString();
    StaticJsonDocument<384> doc;

    if (deserializeJson(doc, responseBody) == DeserializationError::Ok) {
      String command = doc["command"] | "";

      if (command.length() > 0) {
        Serial.print(F("[Dashboard Command Received] -> "));
        Serial.println(command);

        if (command == "WATER_ON") {
          setWater(true);
        } else if (command == "WATER_OFF") {
          setWater(false);
        } else if (command == "MEDICINE_ON") {
          setMedicine(true);
        } else if (command == "MEDICINE_OFF") {
          setMedicine(false);
        } else if (command == "AUTO_ON") {
          autoWater = true;
          Serial.println(F("[Mode] Auto-Watering ENABLED"));
        } else if (command == "AUTO_OFF") {
          autoWater = false;
          setWater(false);
          Serial.println(F("[Mode] Auto-Watering DISABLED"));
        }
      }
    }
  }

  http.end();
}

// =====================================================
// 15. SETUP
// =====================================================
void setup() {
  Serial.begin(115200);
  delay(500);

  Serial.println(F("\n=========================================="));
  Serial.println(F(" AGRICARE ESP8266 SMART AGRI NODE BOOTING "));
  Serial.println(F("=========================================="));

  pinMode(RS485_DE_RE_PIN, OUTPUT);
  digitalWrite(RS485_DE_RE_PIN, LOW); // Set to receive mode

  waterServo.attach(WATER_SERVO_PIN);
  medicineServo.attach(MEDICINE_SERVO_PIN);

  // Initial state: all valves securely closed
  setWater(false);
  setMedicine(false);

  dht.begin();
  npkSerial.begin(NPK_BAUD);

  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  Serial.print(F("Connecting to WiFi: "));
  Serial.println(WIFI_SSID);

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 15000) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print(F("WiFi Connected! IP Address: "));
    Serial.println(WiFi.localIP());
    Serial.print(F("Target Cloud: "));
    Serial.println(RENDER_URL);
  } else {
    Serial.println(F("WiFi Failed or Offline. Autonomous local watering remains active."));
  }
}

// =====================================================
// 16. MAIN LOOP
// =====================================================
void loop() {
  unsigned long now = millis();

  // Non-blocking WiFi reconnect
  if (WiFi.status() != WL_CONNECTED && (now - lastWifiMs >= 10000)) {
    lastWifiMs = now;
    WiFi.disconnect();
    WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  }

  // Local sensor read and autonomous safety loop
  readSensors();

  // Upload telemetry every 5 seconds
  if (now - lastUploadMs >= 5000) {
    lastUploadMs = now;
    if (WiFi.status() == WL_CONNECTED) {
      uploadTelemetry();
    }
  }

  // Poll cloud dashboard commands every 5 seconds
  if (now - lastCommandMs >= 5000) {
    lastCommandMs = now;
    if (WiFi.status() == WL_CONNECTED) {
      pollCommands();
    }
  }

  delay(10);
}
