import { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native';
import { colors } from '../../theme';
import { Option } from './signupOptions';

type ChipGroupProps<T> = {
  options: Option<T>[];
  selected: T[];
  onToggle: (value: T) => void;
  columns: 2 | 3 | 4;
};

// 단일 선택이면 selected 에 하나만 넘기고, onToggle 에서 그 값으로 바꾼다
export function ChipGroup<T>({ options, selected, onToggle, columns }: ChipGroupProps<T>) {
  return (
    <View style={styles.chips}>
      {options.map((option) => {
        const active = selected.includes(option.value);
        return (
          <Pressable
            key={String(option.value)}
            accessibilityRole="button"
            accessibilityState={{ selected: active }}
            onPress={() => onToggle(option.value)}
            style={[styles.chip, { width: `${100 / columns - 3}%` }, active && styles.chipActive]}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{active ? `✓ ${option.label}` : option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function CheckBox({ checked }: { checked: boolean }) {
  return (
    <View style={[styles.box, checked && styles.boxChecked]}>
      {checked ? <Text style={styles.boxMark}>✓</Text> : null}
    </View>
  );
}

type CheckRowProps = { checked: boolean; onPress: () => void; title: ReactNode; description?: string };

export function CheckRow({ checked, onPress, title, description }: CheckRowProps) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityState={{ checked }} onPress={onPress} style={styles.checkRow}>
      <CheckBox checked={checked} />
      <View style={styles.checkCopy}>
        <Text style={styles.checkTitle}>{title}</Text>
        {description ? <Text style={styles.checkDescription}>{description}</Text> : null}
      </View>
    </Pressable>
  );
}

type FieldProps = TextInputProps & { label: string; icon?: string; error?: string };

export function Field({ label, icon, error, style, ...inputProps }: FieldProps) {
  return (
    <View style={style}>
      <View style={[styles.field, error ? styles.fieldError : null]}>
        {icon ? <Text style={styles.fieldIcon}>{icon}</Text> : null}
        <View style={styles.fieldBody}>
          <Text style={styles.fieldLabel}>{label}</Text>
          <TextInput placeholderTextColor={colors.disabledText} style={styles.fieldInput} {...inputProps} />
        </View>
      </View>
      {error ? <Text style={styles.fieldErrorText}>{error}</Text> : null}
    </View>
  );
}

export function SectionTitle({ title, hint }: { title: string; hint?: string }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {hint ? <Text style={styles.sectionHint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  chips: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 10 },
  chip: { height: 50, borderRadius: 25, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  chipActive: { borderColor: colors.brand, backgroundColor: colors.brand },
  chipText: { color: colors.ink, fontSize: 15 },
  chipTextActive: { color: colors.surface, fontWeight: '700' },
  box: { width: 26, height: 26, borderRadius: 7, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  boxChecked: { borderColor: colors.brand, backgroundColor: colors.brand },
  boxMark: { color: colors.surface, fontSize: 15, fontWeight: '800' },
  checkRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 11, flex: 1 },
  checkCopy: { flex: 1, marginLeft: 13 },
  checkTitle: { color: colors.ink, fontSize: 15, fontWeight: '700' },
  checkDescription: { color: colors.muted, fontSize: 12, marginTop: 3 },
  field: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 14, backgroundColor: colors.surface, paddingHorizontal: 16, paddingVertical: 10 },
  fieldIcon: { color: colors.brand, fontSize: 18, marginRight: 12 },
  fieldBody: { flex: 1 },
  fieldLabel: { color: colors.muted, fontSize: 12 },
  fieldInput: { color: colors.ink, fontSize: 17, paddingVertical: 4 },
  fieldError: { borderColor: colors.error },
  fieldErrorText: { color: colors.error, fontSize: 12, marginTop: 6, marginLeft: 4 },
  section: { marginTop: 26, marginBottom: 12 },
  sectionTitle: { color: colors.ink, fontSize: 16, fontWeight: '800' },
  sectionHint: { color: colors.muted, fontSize: 12, marginTop: 4 },
});
