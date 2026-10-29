# AgriCare ESP8266 IoT Hardware Guide

This directory contains the production-tested firmware for the **AgriCare Smart Agriculture IoT Node**.

---

## 📌 Hardware Components

| Component | Purpose | Recommended Model |
| :--- | :--- | :--- |
| **Microcontroller** | Main IoT Node & Cloud Gateway | NodeMCU v2 or v3 (ESP-12E / ESP8266) |
| **Soil Moisture Sensor** | Measures volumetric soil moisture | Capacitive Soil Moisture Sensor v1.2 / v2.0 |
| **Air Temperature & Humidity** | Ambient weather & microclimate | DHT22 (AM2302) |
| **Soil NPK Sensor** | Soil Nitrogen, Phosphorus, Potassium | 3-in-1 Soil NPK Sensor (RS485 Modbus RTU) |
| **RS485 Transceiver** | TTL to RS485 communication | MAX485 Module |
| **Water Valve Actuator** | Controls irrigation pipeline | 9g Micro Servo (SG90) or Metal Gear (MG996R) |
| **Fertilizer Valve Actuator**| Doses liquid medicine / bio-fertilizer | 9g Micro Servo (SG90) or Metal Gear (MG996R) |
| **Power Supply** | Powers NodeMCU and Servos | 5V / 2A external DC power adapter or solar pack |

---

## 🔌 Pin Connection Diagram

### 1. Soil Moisture Sensor (Analog)
- **VCC** $\rightarrow$ 3.3V or 5V (Capacitive v1.2 works best at 3.3V)
- **GND** $\rightarrow$ GND
- **AOUT (Signal)** $\rightarrow$ **A0** on NodeMCU

### 2. DHT22 Temperature & Humidity Sensor
- **VCC (Pin 1)** $\rightarrow$ 3.3V
- **DATA (Pin 2)** $\rightarrow$ **D2** (GPIO 4) on NodeMCU *(with 10kΩ pull-up resistor to 3.3V)*
- **GND (Pin 4)** $\rightarrow$ GND

### 3. MAX485 Transceiver & NPK Sensor
- **MAX485 VCC** $\rightarrow$ 5V
- **MAX485 GND** $\rightarrow$ GND
- **MAX485 RO (Receiver Output)** $\rightarrow$ **D7** (GPIO 13, SoftwareSerial RX)
- **MAX485 DI (Driver Input)** $\rightarrow$ **D1** (GPIO 5, SoftwareSerial TX)
- **MAX485 DE & RE** $\rightarrow$ Jumpered together $\rightarrow$ **D0** (GPIO 16)
- **MAX485 A** $\rightarrow$ NPK Sensor **Yellow Wire (A+)**
- **MAX485 B** $\rightarrow$ NPK Sensor **Blue/Green Wire (B-)**
- **NPK Power** $\rightarrow$ External 9V - 24V DC *(Ground tied to NodeMCU ground)*

### 4. Servo Actuators (Valves)
- **Water Servo Signal** $\rightarrow$ **D5** (GPIO 14)
- **Medicine Servo Signal** $\rightarrow$ **D6** (GPIO 12)
- **Servo VCC** $\rightarrow$ External 5V DC *(Do not power servos directly from 3.3V pin)*
- **Servo GND** $\rightarrow$ Common GND

---

## ⚙️ Configuration in `AgriCare_ESP8266.ino`

Before uploading, update Section 1 of the sketch:

```cpp
const char* WIFI_SSID     = "YOUR_WIFI_NAME";        // Your 2.4 GHz WiFi SSID
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";    // Your WiFi Password

// Set your Render backend URL once deployed
const char* RENDER_URL    = "https://agricare-api.onrender.com";

// Must match the DEVICE_API_KEY environment variable on your Render backend
const char* API_KEY       = "agricare_live_secret_key_2026";
```

---

## 🚀 Flashing via Arduino IDE

1. Open Arduino IDE.
2. Install the **ESP8266 Board Package**:
   - Go to `File` $\rightarrow$ `Preferences` $\rightarrow$ `Additional Boards Manager URLs`:
   - Add: `http://arduino.esp8266.com/stable/package_esp8266com_index.json`
   - Open `Tools` $\rightarrow$ `Board` $\rightarrow$ `Boards Manager` $\rightarrow$ Search **esp8266** $\rightarrow$ Install.
3. Install required libraries from `Sketch` $\rightarrow$ `Include Library` $\rightarrow$ `Manage Libraries`:
   - **ArduinoJson** (Version 6.x)
   - **DHT sensor library** (by Adafruit) + Adafruit Unified Sensor
   - **Servo** (built into ESP8266 board core)
4. Select `Tools` $\rightarrow$ `Board` $\rightarrow$ `NodeMCU 1.0 (ESP-12E Module)`.
5. Connect your NodeMCU via USB and select the COM port.
6. Click **Upload** (Ctrl + U).
7. Open **Serial Monitor** at **115200 baud** to see live readings and cloud telemetry uploads!
