import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme';

type Props = { eyebrow?: string; title: string; description?: string };

export function ScreenHeader({ eyebrow, title, description }: Props) {
  return (
    <View style={styles.wrap}>
      {eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 24 },
  eyebrow: { color: colors.orange, fontSize: 13, fontWeight: '700', marginBottom: 8 },
  title: { color: colors.ink, fontSize: 27, fontWeight: '800', lineHeight: 34 },
  description: { color: colors.muted, fontSize: 14, lineHeight: 21, marginTop: 8 },
});
