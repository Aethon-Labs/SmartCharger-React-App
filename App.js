import React, { useState, useEffect } from 'react';
import { View, Text, Switch, Button } from 'react-native';
import MQTT from 'sp-react-native-mqtt';

const MQTT_HOST = 'mqtt://broker.example.com';
const MQTT_PORT = 1883;
const MQTT_TOPIC = 'smart_power_bank/status';
const MQTT_CLIENT_ID = `smart-power-bank-${Math.random().toString(16).substr(2, 8)}`;

const App = () => {
  const [chargerStatus, setChargerStatus] = useState(null);
  const [chargingMode, setChargingMode] = useState(false);

  useEffect(() => {
    const client = MQTT.createClient({
      uri: MQTT_HOST,
      port: MQTT_PORT,
      clientId: MQTT_CLIENT_ID,
    });

    client.on('connect', () => {
      client.subscribe(MQTT_TOPIC);
    });

    client.on('message', (topic, message) => {
      if (topic === MQTT_TOPIC) {
        const data = JSON.parse(message);
        setChargerStatus(data);
      }
    });

    return () => {
      client.end();
    };
  }, []);

  const handleToggleChargingMode = () => {
    setChargingMode(!chargingMode);

    // Publish the new charging mode to the MQTT broker
    const client = MQTT.createClient({
      uri: MQTT_HOST,
      port: MQTT_PORT,
      clientId: MQTT_CLIENT_ID,
    });

    client.on('connect', () => {
      const message = JSON.stringify({ chargingMode: !chargingMode });
      client.publish(MQTT_TOPIC, message);
    });
  };

  const handlePowerOff = () => {
    // Publish the power off command to the MQTT broker
    const client = MQTT.createClient({
      uri: MQTT_HOST,
      port: MQTT_PORT,
      clientId: MQTT_CLIENT_ID,
    });

    client.on('connect', () => {
      const message = JSON.stringify({ powerOff: true });
      client.publish(MQTT_TOPIC, message);
    });
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 24 }}>Smart Power Bank</Text>

      {chargerStatus ? (
        <View style={{ alignItems: 'center' }}>
          <Text style={{ fontSize: 18, marginBottom: 16 }}>Battery Level: {chargerStatus.batteryLevel}%</Text>
          <Text style={{ fontSize: 18 }}>
            Charging Status: {chargerStatus.chargingStatus}
          </Text>
        </View>
      ) : (
        <Text style={{ fontSize: 18, color: 'gray', textAlign: 'center' }}>Waiting for status updates...</Text>
      )}

      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 24 }}>
        <Text style={{ fontSize: 18, marginRight: 16 }}>Charging Mode:</Text>
        <Switch value={chargingMode} onValueChange={handleToggleChargingMode} />
      </View>

      <Button title="Power Off" onPress={handlePowerOff} style={{ marginTop: 24 }} />
    </View>
  );
};

export default App;

