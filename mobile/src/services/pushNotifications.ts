import { Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Alert } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export async function registerForPushNotificationsAsync() {
  let token;

  // Controllo preliminare per evitare crash su Expo Go Android (SDK 53+)
  if (Platform.OS === 'android' && Constants.appOwnership === 'expo') {
    console.log("⚠️ AVVISO: Le notifiche push non sono supportate su Expo Go per Android (SDK 53+).");
    console.log("Per testarle su Android serve una Development Build.");
    return null; // Ritorniamo null senza rompere l'app
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    try {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        
        if (finalStatus !== 'granted') {
          Alert.alert("Errore", "Permesso notifiche negato!"); // <--- Meglio un Alert anche qui
          console.log('Permesso notifiche negato!');
          return null;
        }

        const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;
        
        try {
            const tokenData = await Notifications.getExpoPushTokenAsync({
                projectId: projectId, 
            });
            token = tokenData.data;

            // ======================================================
            // INSERISCI QUI IL TUO CODICE DI DEBUG
            // ======================================================
            console.log("ECCO IL TOKEN:", token);

        } catch (tokenError) {
            console.warn("Errore generazione token:", tokenError);
            Alert.alert("Errore Token", JSON.stringify(tokenError));
            return null;
        }

    } catch (e) {
        console.error("Errore permessi notifiche:", e);
        return null;
    }

  } else {
    alert('Devi usare un dispositivo fisico per le Notifiche Push');
  }

  return token;
}