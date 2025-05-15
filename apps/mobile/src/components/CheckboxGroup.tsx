import React from "react"
import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import { Ionicons } from "@expo/vector-icons"
import { colors } from "../theme/colors"

interface CheckboxGroupItem {
  id: string
  label: string
}

interface CheckboxGroupProps {
  items: CheckboxGroupItem[]
  selectedIds: string[]
  onChange: (selectedIds: string[]) => void
}

export function CheckboxGroup({ items, selectedIds, onChange }: CheckboxGroupProps) {
  const handleToggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((selectedId) => selectedId !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  return (
    <View style={styles.container}>
      {items.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={styles.item}
          onPress={() => handleToggle(item.id)}
        >
          <View
            style={[
              styles.checkbox,
              selectedIds.includes(item.id) && styles.checkboxSelected,
            ]}
          >
            {selectedIds.includes(item.id) && (
              <Ionicons name="checkmark" size={16} color="white" />
            )}
          </View>
          <Text style={styles.label}>{item.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkboxSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  label: {
    fontSize: 16,
    color: colors.text,
  },
})
