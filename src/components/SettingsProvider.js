import React, { useContext } from "react"
import { openDB } from 'idb'

const dbPromise = openDB('settingsDb', 1, {
  upgrade(db) {
    db.createObjectStore('settings');
  },
})

const idbSettings = {
  async get(key) {
    return (await dbPromise).get('settings', key);
  },
  async set(key, val) {
    return (await dbPromise).put('settings', val, key);
  },
  async delete(key) {
    return (await dbPromise).delete('settings', key);
  },
  async clear() {
    return (await dbPromise).clear('settings');
  },
  async keys() {
    return (await dbPromise).getAllKeys('settings');
  },
}

export const SettingsContext = React.createContext(
  idbSettings
)

export default function SettingsProvider(props) {
  const settings = useContext(SettingsContext)
  return <SettingsContext.Provider value={settings}>{props.children}</SettingsContext.Provider>
}