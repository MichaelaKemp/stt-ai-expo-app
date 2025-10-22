import axios from 'axios';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { Buffer } from 'buffer';

const API_KEY = process.env.GOOGLE_TTS_KEY;
const GOOGLE_TTS_URL = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${API_KEY}`;

const setAudioMode = async () => {
  await Audio.requestPermissionsAsync();
  await Audio.setAudioModeAsync({
    playsInSilentModeIOS: true,
  });
};

const textToSpeech = async (text) => {
  try {
    console.log("Generating speech...");

    await setAudioMode();

    const response = await axios.post(GOOGLE_TTS_URL, {
      input: { text },
      voice: {
        languageCode: 'en-US',
        ssmlGender: 'FEMALE',
      },
      audioConfig: {
        audioEncoding: 'MP3',
      },
    });

    const audioContent = response.data.audioContent;

    // Convert base64 audio data into binary format
    const audioBuffer = Buffer.from(audioContent, 'base64');
    const filePath = FileSystem.documentDirectory + 'tts-output.mp3';

    await FileSystem.writeAsStringAsync(filePath, audioContent, {
    encoding: 'base64',
    });

    // Play the generated audio file
    const { sound } = await Audio.Sound.createAsync({ uri: filePath });
    await sound.playAsync();

    console.log("Speech playback complete.");
  } catch (error) {
    console.error('Error using Google TTS API:', error);
  }
};

export default textToSpeech;