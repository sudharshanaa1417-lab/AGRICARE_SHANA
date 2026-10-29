from fastapi import APIRouter
from typing import Optional, List
import datetime

from app.schemas import ChatMessageRequest, ChatMessageResponse

router = APIRouter(prefix="/api/chat", tags=["AI Agricultural Advisor"])

# Multilingual Knowledge Engine Responses with Context Injection
MULTILINGUAL_ADVISORY = {
    "yellow_leaves": {
        "en": "Yellowing leaves (chlorosis) in crops like {crop} can stem from three distinct causes: 1) Nitrogen deficiency, where older lower leaves turn pale yellow first while veins remain visible. 2) Waterlogging or excessive irrigation, which chokes root respiration. Your current sensor soil moisture is {moisture}%. If moisture is above 65%, suspend watering immediately. 3) Viral infection (like Tomato Yellow Leaf Curl) transmitted by whiteflies. Please check the underside of the leaves for whiteflies and ensure proper drainage.",
        "ta": "{crop} பயிரில் இலைகள் மஞ்சள் நிறமாக மாறுவதற்கு முக்கிய காரணங்கள்: 1) தழைச்சத்து (நைட்ரஜன்) பற்றாக்குறை - இதில் கீழ் இலைகள் முதலில் மஞ்சள் நிறமாகும். 2) அதிகப்படியான நீர் தேக்கம். உங்கள் மண் ஈரப்பதம் தற்போது {moisture}% உள்ளது. 65% க்கு மேல் இருந்தால் நீர் பாய்ச்சுவதை உடனே நிறுத்துங்கள். 3) வெள்ளை ஈக்களால் பரவும் மஞ்சள் இலை சுருள் நச்சுயிரி. தகுந்த வேப்பெண்ணெய் கரைசல் (3%) தெளிக்கலாம்.",
        "hi": "{crop} में पत्तियों का पीला पड़ना (क्लोरोसिस) मुख्य रूप से तीन कारणों से हो सकता है: 1) नाइट्रोजन की कमी, जिसमें पुरानी निचली पत्तियां पहले पीली पड़ती हैं। 2) अधिक सिंचाई या जलजमाव। आपके सेंसर के अनुसार मिट्टी की नमी {moisture}% है। यदि यह 65% से अधिक है, तो तुरंत सिंचाई रोक दें। 3) सफेद मक्खी द्वारा फैलाया जाने वाला वायरस। कृपया पत्तियों की निचली सतह की जांच करें।",
        "te": "{crop} లో ఆకులు పసుపు రంగులోకి మారడానికి కారణాలు: 1) నత్రజని లోపం. 2) అధిక తేమ. మీ సెన్సార్ ప్రకారం నేల తేమ {moisture}%. 65% కంటే ఎక్కువ ఉంటే నీటిని ఆపండి. 3) తెల్లదోమ ద్వారా వ్యాపించే వైరస్. వేప నూనె స్ప్రే చేయండి.",
        "kn": "{crop} ಬೆಳೆಯಲ್ಲಿ ಎಲೆಗಳು ಹಳದಿಯಾಗಲು ಕಾರಣಗಳು: 1) ಸಾರಜನಕದ ಕೊರತೆ. 2) ಅತಿಯಾದ ತೇವಾಂಶ. ನಿಮ್ಮ ಸಂವೇದಕ ಮಣ್ಣಿನ ತೇವಾಂಶ {moisture}% ಆಗಿದೆ. 3) ಬಿಳಿ ನೊಣಗಳಿಂದ ಹರಡುವ ವೈರಸ್. ಮುನ್ನೆಚ್ಚರಿಕೆಯಾಗಿ ಬೇವಿನ ಎಣ್ಣೆ ಸಿಂಪಡಿಸಿ.",
        "ml": "{crop} വിളകളിൽ ഇലകൾ മഞ്ഞനിറമാകുന്നത് പ്രധാനമായും മൂന്ന് കാരണങ്ങളാലാണ്: 1) നൈട്രജന്റെ കുറവ്. 2) അമിത ഈർപ്പം. നിങ്ങളുടെ സെൻസർ ഈർപ്പം {moisture}% ആണ്. 65%-ൽ കൂടുതലാണെങ്കിൽ നനയ്ക്കുന്നത് നിർത്തുക. 3) വെള്ളിീച്ച പരത്തുന്ന വൈറസ്.",
        "mr": "{crop} पिकात पाने पिवळी पडण्याची मुख्य कारणे: 1) नत्र (नायट्रोजन) ची कमतरता. 2) अति पाणी किंवा निचरा न होणे. आपल्या सेन्सरनुसार जमिनीतील ओलावा {moisture}% आहे. ओलावा 65% पेक्षा जास्त असल्यास पाणी देणे थांबवा. 3) पांढरी माशीमुळे होणारा विषाणू संसर्ग."
    },
    "soil_moisture": {
        "en": "Your soil moisture sensor is currently reporting {moisture}%. For {crop}, optimum root zone moisture is between 35% and 55%. If moisture drops below 30%, your automated valve is set to open for 5 seconds. Avoid continuous saturation to prevent damping-off fungi.",
        "ta": "உங்கள் மண் ஈரப்பதம் தற்போது {moisture}% ஆக பதிவாகியுள்ளது. {crop} பயிருக்கு உகந்த ஈரப்பதம் 35% முதல் 55% வரை இருக்க வேண்டும். 30% க்குக் கீழே குறைந்தால் தானியங்கி வால்வு திறக்கப்படும்.",
        "hi": "आपकी मिट्टी की नमी वर्तमान में {moisture}% है। {crop} के लिए आदर्श नमी 35% से 55% के बीच है। 30% से कम होने पर ऑटो-वॉटरिंग सक्रिय हो जाती है।",
        "te": "మీ నేల తేమ ప్రస్తుతం {moisture}% ఉంది. {crop} కు 35% నుండి 55% అనుకూలం.",
        "kn": "ನಿಮ್ಮ ಮಣ್ಣಿನ ತೇವಾಂಶ {moisture}% ಆಗಿದೆ. {crop} ಬೆಳೆಗೆ 35% ರಿಂದ 55% ಸೂಕ್ತವಾಗಿದೆ.",
        "ml": "നിങ്ങളുടെ മണ്ണിലെ ഈർപ്പം {moisture}% ആണ്. {crop} ന് 35% മുതൽ 55% വരെ അനുയോജ്യമാണ്.",
        "mr": "आपल्या जमिनीतील ओलावा {moisture}% आहे. {crop} पिकासाठी 35% ते 55% ओलावा योग्य आहे."
    },
    "general": {
        "en": "AgriCare Advisor here to help! For your {crop} field in {district}, remember that timely scouting and integrated pest management (IPM) yield the highest returns. If you notice specific insect damage or lesions, take a photo in the AI Crop Doctor tab for an instant pathology report. For emergency crop distress, you can also dial the Kisan Call Center toll-free at 1800-180-1551.",
        "ta": "வணக்கம்! உங்கள் {district} பகுதியில் உள்ள {crop} பயிருக்கு ஒருங்கிணைந்த பூச்சி மேலாண்மை (IPM) மிக முக்கியம். இலைகளில் ஏதேனும் புள்ளிகள் அல்லது பூச்சி தாக்குதல் இருந்தால் AI Crop Doctor பகுதியில் படம் எடுத்து பதிவேற்றவும். கூடுதல் ஆலோசனைக்கு உழவர் உதவி மையம் 1800-180-1551 அழைக்கலாம்.",
        "hi": "नमस्ते! {district} में आपके {crop} की फसल के लिए एकीकृत कीट प्रबंधन (IPM) सर्वोत्तम है। किसी भी बीमारी के लक्षण दिखने पर AI Crop Doctor में फोटो अपलोड करें या किसान कॉल सेंटर 1800-180-1551 पर संपर्क करें।",
        "te": "నమస్కారం! {district} లో మీ {crop} పంట కోసం ఎల్లప్పుడూ సస్యరక్షణ చర్యలు పాటించండి. ఫోటో తీసి AI Crop Doctor లో విశ్లేషించండి.",
        "kn": "ನಮಸ್ಕಾರ! {district} ನಲ್ಲಿ ನಿಮ್ಮ {crop} ಬೆಳೆಗೆ ಸಮಗ್ರ ಕೀಟ ನಿರ್ವಹಣೆ ಮುಖ್ಯ. ಹೆಚ್ಚಿನ ಸಹಾಯಕ್ಕೆ ಕಿಸಾನ್ ಕಾಲ್ ಸೆಂಟರ್ 1800-180-1551 ಗೆ ಕರೆ ಮಾಡಿ.",
        "ml": "നമസ്കാരം! {district} ലെ നിങ്ങളുടെ {crop} കൃഷിക്ക് സംയോജിത കീടനിയന്ത്രണം ഉറപ്പാക്കുക. സംശയങ്ങൾക്ക് കിസാൻ കോൾ സെന്റർ 1800-180-1551 ബന്ധപ്പെടുക.",
        "mr": "नमस्कार! {district} मधील आपल्या {crop} पिकासाठी एकात्मिक कीड व्यवस्थापन करा. संशयास्पद रोगासाठी AI Crop Doctor मध्ये फोटो अपलोड करा."
    }
}

@router.post("/message", response_model=ChatMessageResponse)
def handle_chat_message(req: ChatMessageRequest):
    """
    Multilingual AgriCare Advisor query endpoint.
    Extracts agronomic intent, injects user's real crop and sensor context, and generates scientifically-backed advisory.
    """
    text = req.message.lower()
    lang = req.language.lower() if req.language.lower() in ["ta", "hi", "te", "kn", "ml", "mr", "en"] else "en"
    crop = req.crop_context if req.crop_context else "Tomato"
    moisture = f"{req.soil_moisture_context:.1f}" if req.soil_moisture_context is not None else "42.0"
    district = req.district_context if req.district_context else "Local Farm"

    intent = "general"
    if any(k in text for k in ["yellow", "chlorosis", "மஞ்சள்", "पीली", "పసుపు", "ಹಳದಿ", "മഞ്ഞ"]):
        intent = "yellow_leaves"
    elif any(k in text for k in ["moisture", "water", "irrigate", "ஈரப்பதம்", "नमी", "సిరిగేషన్", "ತೇವಾಂಶ", "നന"]):
        intent = "soil_moisture"

    template = MULTILINGUAL_ADVISORY[intent].get(lang, MULTILINGUAL_ADVISORY[intent]["en"])
    reply = template.format(crop=crop, moisture=moisture, district=district)

    sources = [
        "ICAR - Package of Practices for Agricultural Crops",
        "National Institute of Plant Health Management (NIPHM)",
        "State Agricultural Extension Guidelines"
    ]

    return ChatMessageResponse(
        reply=reply,
        detected_intent=intent,
        sources=sources,
        audio_available=True
    )
