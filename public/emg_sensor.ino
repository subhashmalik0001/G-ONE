/*
 * G-ONE Biomedical EMG Firmware
 * Target: Arduino Uno / Nano / Mega / ESP32
 * Baud Rate: 115200 bps
 * Analog Input: Pin A0
 */

const int EMG_PIN = A0;
const unsigned long SAMPLING_INTERVAL_MS = 25; // 40 Hz streaming rate (smooth real-time graph)
unsigned long lastSampleTime = 0;

// Moving average noise filter (window size = 5)
const int FILTER_WINDOW = 5;
int filterBuffer[FILTER_WINDOW];
int filterIndex = 0;
long runningSum = 0;

void setup() {
  // Initialize Serial at high-speed 115200 baud
  Serial.begin(115200);
  
  // Set ADC pin mode
  pinMode(EMG_PIN, INPUT);

  // Pre-fill filter buffer
  int initialRead = analogRead(EMG_PIN);
  for (int i = 0; i < FILTER_WINDOW; i++) {
    filterBuffer[i] = initialRead;
    runningSum += initialRead;
  }

  // Wait for serial stabilization
  delay(200);
}

void loop() {
  unsigned long now = millis();

  if (now - lastSampleTime >= SAMPLING_INTERVAL_MS) {
    lastSampleTime = now;

    // 1. Read Raw Analog Signal (0 - 1023 on Uno)
    int rawValue = analogRead(EMG_PIN);

    // 2. Moving Average Low-Pass Filter
    runningSum -= filterBuffer[filterIndex];
    filterBuffer[filterIndex] = rawValue;
    runningSum += rawValue;
    filterIndex = (filterIndex + 1) % FILTER_WINDOW;
    int smoothedSignal = runningSum / FILTER_WINDOW;

    // 3. Transmit JSON Line Delimited (NDJSON format)
    Serial.print("{\"signal\":");
    Serial.print(smoothedSignal);
    Serial.print(",\"timestamp\":");
    Serial.print(now);
    Serial.println("}"); // println sends '\n' for line buffering
  }
}
