import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StyleSheet, Text, View, Button, FlatList, TextInput, TouchableOpacity } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import Checkbox from 'expo-checkbox';

export default function App() {
  const [adatTomb, setAdatTomb] = useState([]);
  const [szoveg, setSzoveg] = useState("");
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState('date');
  const [show, setShow] = useState(false);
  const [datum, setDatum] = useState("");
  const [isChecked, setChecked] = useState(false);

  const onChange = (event, selectedDate) => {
    const currentDate = selectedDate;
    setShow(false);
    setDate(currentDate);
  };

  const showMode = () => {
    setShow(true);
    setMode("date");
  };

  const storeData = async (value) => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem('feladatok', jsonValue);
    } catch (e) {}
  };

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('feladatok');
      return jsonValue != null ? JSON.parse(jsonValue) : [];
    } catch (e) {}
  };

  useEffect(() => {
    getData().then(adat => {
      setAdatTomb(adat);
    });
  }, []);

  const felvitel = () => {
    let uj = [...adatTomb];
    uj.push({
      "id": uj.length,
      "feladat": szoveg,
      "datum": datum,
      "kesz": 0
    });
    setAdatTomb(uj);
    storeData(uj);
    setSzoveg("");
    setDatum("");
  };

  const torles = () => {
    let uj = [];
    setAdatTomb(uj);
    storeData(uj);
  };

  const valtozikDatum = (event, datum) => {
    setShow(false);
    setDatum(datum.getFullYear() + "/" + (datum.getMonth() + 1) + "/" + datum.getDate());
  };

  const befejezVagyVissza = (id) => {
    let uj = [...adatTomb];
    for (let elem of uj) {
      if (elem.id === id) {
        elem.kesz = elem.kesz === 0 ? 1 : 0;
      }
    }
    setAdatTomb(uj);
    storeData(uj);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Feladat:</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          onChangeText={setSzoveg}
          value={szoveg}
          placeholder="Új feladat hozzáadása"
          placeholderTextColor="#aaa"
        />
        <TouchableOpacity style={styles.clearButton} onPress={() => setSzoveg("")}>
          <Text style={styles.clearButtonText}>x</Text>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.dateButton} onPress={showMode}>
        <Text style={styles.dateButtonText}>DÁTUM</Text>
      </TouchableOpacity>
      <Text style={styles.dateText}>{datum}</Text>
      <TouchableOpacity style={styles.addButton} onPress={felvitel}>
        <Text style={styles.addButtonText}>ÚJ FELADAT</Text>
      </TouchableOpacity>
      <View style={styles.checkboxContainer}>
        <Checkbox style={styles.checkbox} value={isChecked} onValueChange={setChecked} />
        <Text style={styles.checkboxLabel}>korábbiak</Text>
        <TouchableOpacity style={styles.deleteAllButton} onPress={torles}>
          <Text style={styles.deleteAllText}>Mind törlése</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={adatTomb}
        renderItem={({ item }) =>
          <View>
            {(isChecked || !item.kesz) && (
              <View style={[styles.keret, item.kesz && styles.completedTask]}>
                <Text style={styles.taskDate}>{item.datum}</Text>
                <Text style={styles.taskText}>{item.feladat}</Text>
                {item.kesz ? (
                  <TouchableOpacity onPress={() => befejezVagyVissza(item.id)}>
                    <Text style={styles.actionText}>Vissza</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => befejezVagyVissza(item.id)}>
                    <Text style={styles.actionText}>Kész</Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        }
        keyExtractor={(item) => item.id.toString()}
      />

      {show && (
        <DateTimePicker
          testID="dateTimePicker"
          value={date}
          mode={mode}
          is24Hour={true}
          onChange={(event, datum) => valtozikDatum(event, datum)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    alignItems: 'center',
    paddingTop: 40,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: "90%",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 5,
    padding: 10,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    backgroundColor: '#d32f2f',
    padding: 10,
    borderRadius: 5,
    marginLeft: 5,
  },
  clearButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dateButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    width: "90%",
    alignItems: 'center',
    marginBottom: 10,
  },
  dateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  dateText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    backgroundColor: '#ffeb3b',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    textAlign: 'center',
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    width: "90%",
    alignItems: 'center',
    marginBottom: 10,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: "90%",
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  checkbox: {
    marginRight: 8,
  },
  checkboxLabel: {
    fontSize: 16,
    color: '#333',
  },
  deleteAllButton: {
    backgroundColor: '#d32f2f',
    padding: 5,
    borderRadius: 5,
  },
  deleteAllText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  keret: {
    marginVertical: 5,
    width: '90%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  completedTask: {
    backgroundColor: '#e0e0e0',
  },
  taskText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  taskDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  actionText: {
    fontSize: 14,
    color: '#ff9800',
    textAlign: 'right',
    marginTop: 10,
  }
});
