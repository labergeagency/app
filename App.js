import { useEffect, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'tasks';
const FILTERS = ['All', 'Active', 'Done'];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [text, setText] = useState('');
  const [filter, setFilter] = useState('All');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((value) => value && setTasks(JSON.parse(value)))
      .catch(() => {})
      .finally(() => setLoaded(true));
  }, []);

  useEffect(() => {
    if (loaded) AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)).catch(() => {});
  }, [tasks, loaded]);

  const addTask = () => {
    const title = text.trim();
    if (!title) return;
    setTasks((prev) => [{ id: Date.now().toString(), title, done: false }, ...prev]);
    setText('');
  };

  const toggleTask = (id) =>
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const deleteTask = (id) => setTasks((prev) => prev.filter((t) => t.id !== id));

  const clearDone = () => setTasks((prev) => prev.filter((t) => !t.done));

  const visible = tasks.filter((t) =>
    filter === 'All' ? true : filter === 'Done' ? t.done : !t.done
  );
  const remaining = tasks.filter((t) => !t.done).length;

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <Text style={styles.title}>My Tasks</Text>
        <Text style={styles.subtitle}>{remaining} remaining</Text>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Add a task..."
            value={text}
            onChangeText={setText}
            onSubmitEditing={addTask}
            returnKeyType="done"
          />
          <Pressable style={styles.addButton} onPress={addTask}>
            <Text style={styles.addButtonText}>Add</Text>
          </Pressable>
        </View>

        <View style={styles.filters}>
          {FILTERS.map((f) => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[styles.filter, filter === f && styles.filterActive]}
            >
              <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                {f}
              </Text>
            </Pressable>
          ))}
        </View>

        <FlatList
          data={visible}
          keyExtractor={(t) => t.id}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>Nothing here yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.task}>
              <Pressable style={styles.taskMain} onPress={() => toggleTask(item.id)}>
                <View style={[styles.checkbox, item.done && styles.checkboxDone]}>
                  {item.done && <Text style={styles.check}>✓</Text>}
                </View>
                <Text style={[styles.taskText, item.done && styles.taskTextDone]}>
                  {item.title}
                </Text>
              </Pressable>
              <Pressable onPress={() => deleteTask(item.id)} hitSlop={8}>
                <Text style={styles.delete}>✕</Text>
              </Pressable>
            </View>
          )}
        />

        {tasks.some((t) => t.done) && (
          <Pressable onPress={clearDone} style={styles.clear}>
            <Text style={styles.clearText}>Clear completed</Text>
          </Pressable>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#f5f6fa' },
  container: { flex: 1, padding: 20 },
  title: { fontSize: 32, fontWeight: '700', color: '#1f2430', marginTop: 16 },
  subtitle: { fontSize: 14, color: '#7a8194', marginBottom: 16 },
  inputRow: { flexDirection: 'row', gap: 8 },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  addButton: {
    backgroundColor: '#4f6df5',
    borderRadius: 10,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  filters: { flexDirection: 'row', gap: 8, marginVertical: 16 },
  filter: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, backgroundColor: '#e4e7f0' },
  filterActive: { backgroundColor: '#4f6df5' },
  filterText: { color: '#4a5168', fontWeight: '500' },
  filterTextActive: { color: '#fff' },
  list: { gap: 8, paddingBottom: 16 },
  empty: { textAlign: 'center', color: '#7a8194', marginTop: 32 },
  task: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
  },
  taskMain: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#b5bbcc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: { backgroundColor: '#4f6df5', borderColor: '#4f6df5' },
  check: { color: '#fff', fontSize: 14, fontWeight: '700' },
  taskText: { flex: 1, fontSize: 16, color: '#1f2430' },
  taskTextDone: { textDecorationLine: 'line-through', color: '#9aa1b5' },
  delete: { color: '#d25b5b', fontSize: 18, paddingLeft: 12 },
  clear: { alignItems: 'center', padding: 12 },
  clearText: { color: '#d25b5b', fontWeight: '600' },
});
