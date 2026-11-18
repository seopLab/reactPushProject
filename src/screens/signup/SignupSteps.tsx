import * as Location from 'expo-location';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../theme';
import { AgreementKey, DocumentType, ExtraCondition, HousingOwnership, SignupResponse, SupplyType } from '../../types/signup';
import { CheckBox, CheckRow, ChipGroup, Field, SectionTitle } from './SignupParts';
import {
  accountOptions, agreements, documentOptions, extraOptions, householdOptions, housingOptions, labelOf, labelsOf, supplyOptions,
} from './signupOptions';

export type SignupDraft = Record<AgreementKey, boolean> & {
  region: string;
  latitude: number | null;
  longitude: number | null;
  birthDate: string;
  householdSize: number | null;
  housingOwnership: HousingOwnership | null;
  supplyTypes: SupplyType[];
  hasSubscriptionAccount: boolean | null;
  years: string;
  months: string;
  extraConditions: ExtraCondition[];
  preparedDocuments: DocumentType[];
};

type StepProps = { draft: SignupDraft; update: (patch: Partial<SignupDraft>) => void };

function toggle<T>(values: T[], value: T) {
  return values.includes(value) ? values.filter((item) => item !== value) : [...values, value];
}

// 숫자만 받아 YYYY-MM-DD 로 끊어 보여준다
function formatBirthDate(text: string) {
  const digits = text.replace(/\D/g, '').slice(0, 8);
  return [digits.slice(0, 4), digits.slice(4, 6), digits.slice(6, 8)].filter(Boolean).join('-');
}

export function ConsentStep({ draft, update }: StepProps) {
  const [opened, setOpened] = useState<AgreementKey | null>(null);
  const allAgreed = agreements.every((item) => draft[item.key]);

  function agreeAll() {
    const next = !allAgreed;
    update(Object.fromEntries(agreements.map((item) => [item.key, next])));
  }

  return (
    <View>
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: allAgreed }} onPress={agreeAll} style={styles.agreeAll}>
        <CheckBox checked={allAgreed} />
        <Text style={styles.agreeAllText}>전체 동의하기</Text>
      </Pressable>

      <View style={styles.card}>
        {agreements.map((item) => (
          <View key={item.key}>
            <View style={styles.agreeRow}>
              <CheckRow
                checked={draft[item.key]}
                onPress={() => update({ [item.key]: !draft[item.key] })}
                title={<><Text style={item.required ? styles.required : styles.optional}>{item.required ? '(필수) ' : '(선택) '}</Text>{item.label}</>}
              />
              <Pressable hitSlop={8} onPress={() => setOpened(opened === item.key ? null : item.key)}>
                <Text style={styles.viewLink}>{opened === item.key ? '접기' : '보기'}</Text>
              </Pressable>
            </View>
            {opened === item.key ? <Text style={styles.terms}>{item.detail}</Text> : null}
          </View>
        ))}
      </View>
    </View>
  );
}

export function InfoStep({ draft, update }: StepProps) {
  const [locationMessage, setLocationMessage] = useState('');
  const [isLocating, setIsLocating] = useState(false);

  async function useCurrentLocation() {
    if (!draft.locationAgreed) {
      setLocationMessage('위치정보 이용에 동의해야 사용할 수 있어요. 지역을 직접 입력해 주세요.');
      return;
    }
    setIsLocating(true);
    setLocationMessage('');
    try {
      const permission = await Location.requestForegroundPermissionsAsync();
      if (permission.status !== Location.PermissionStatus.GRANTED) {
        setLocationMessage('위치 권한이 없어요. 지역을 직접 입력해 주세요.');
        return;
      }
      const position = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coordinates = { latitude: position.coords.latitude, longitude: position.coords.longitude };
      const place = (await Location.reverseGeocodeAsync(coordinates))[0];
      const city = place?.city ?? place?.subregion ?? '';
      const district = place?.district ? ` ${place.district}` : '';
      update({ ...coordinates, region: `${place?.region ?? ''} ${city}${district}`.trim() || '현재 위치' });
    } catch {
      setLocationMessage('현재 위치를 확인하지 못했어요. 지역을 직접 입력해 주세요.');
    } finally {
      setIsLocating(false);
    }
  }

  return (
    <View>
      <Field
        icon="◉"
        label="알림 기준 지역"
        placeholder="예: 서울특별시 강남구"
        value={draft.region}
        maxLength={50}
        onChangeText={(region) => update({ region, latitude: null, longitude: null })}
      />
      <Pressable onPress={useCurrentLocation} disabled={isLocating} style={styles.locationButton}>
        <Text style={styles.locationButtonText}>{isLocating ? '현재 위치를 찾는 중…' : '⌖ 현재 위치로 설정'}</Text>
      </Pressable>
      {locationMessage ? <Text style={styles.note}>{locationMessage}</Text> : null}

      <Field
        label="생년월일"
        placeholder="예: 1990-01-01"
        keyboardType="number-pad"
        maxLength={10}
        value={draft.birthDate}
        onChangeText={(text) => update({ birthDate: formatBirthDate(text) })}
      />

      <SectionTitle title="주민등록상 가구원 수" hint="공급 자격을 확인하는 참고 정보로만 사용해요." />
      <ChipGroup
        columns={4}
        options={householdOptions}
        selected={draft.householdSize ? [draft.householdSize] : []}
        onToggle={(householdSize) => update({ householdSize })}
      />

      <SectionTitle title="현재 주택을 보유하고 있나요?" />
      <ChipGroup
        columns={3}
        options={housingOptions}
        selected={draft.housingOwnership ? [draft.housingOwnership] : []}
        onToggle={(housingOwnership) => update({ housingOwnership })}
      />
    </View>
  );
}

export function ConditionsStep({ draft, update }: StepProps) {
  const [showExtra, setShowExtra] = useState(draft.extraConditions.length > 0);

  return (
    <View>
      <SectionTitle title="관심 있는 공급 유형" hint="여러 개를 선택할 수 있어요." />
      <ChipGroup
        columns={2}
        options={supplyOptions}
        selected={draft.supplyTypes}
        onToggle={(value) => update({ supplyTypes: toggle(draft.supplyTypes, value) })}
      />

      <SectionTitle title="청약통장에 가입되어 있나요?" />
      <ChipGroup
        columns={2}
        options={accountOptions}
        selected={draft.hasSubscriptionAccount === null ? [] : [draft.hasSubscriptionAccount]}
        onToggle={(hasSubscriptionAccount) => update({ hasSubscriptionAccount })}
      />
      {draft.hasSubscriptionAccount ? (
        <>
          <View style={styles.periodRow}>
            <Field style={styles.periodField} label="가입 기간 (년)" placeholder="예: 8" keyboardType="number-pad" maxLength={2} value={draft.years} onChangeText={(years) => update({ years: years.replace(/\D/g, '') })} />
            <Field style={styles.periodField} label="개월" placeholder="예: 3" keyboardType="number-pad" maxLength={2} value={draft.months} onChangeText={(months) => update({ months: months.replace(/\D/g, '') })} />
          </View>
          <Text style={styles.note}>정확하지 않아도 괜찮아요. 나중에 수정할 수 있어요.</Text>
        </>
      ) : null}

      <View style={[styles.card, styles.extraCard]}>
        <Pressable accessibilityState={{ expanded: showExtra }} onPress={() => setShowExtra(!showExtra)} style={styles.extraToggle}>
          <View style={styles.extraCopy}>
            <Text style={styles.extraTitle}>추가 조건 (선택)</Text>
            <Text style={styles.extraDescription}>신혼부부 · 생애최초 · 다자녀 등 해당하는 조건만 선택해요.</Text>
          </View>
          <Text style={styles.arrow}>{showExtra ? '⌄' : '›'}</Text>
        </Pressable>
        {showExtra ? (
          <View style={styles.extraChips}>
            <ChipGroup
              columns={2}
              options={extraOptions}
              selected={draft.extraConditions}
              onToggle={(value) => update({ extraConditions: toggle(draft.extraConditions, value) })}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

export function DocumentsStep({ draft, update }: StepProps) {
  return (
    <View>
      <View style={styles.card}>
        <Text style={styles.cardTitle}>청약 때 확인할 수 있는 서류</Text>
        {documentOptions.map((document) => (
          <CheckRow
            key={document.value}
            checked={draft.preparedDocuments.includes(document.value)}
            onPress={() => update({ preparedDocuments: toggle(draft.preparedDocuments, document.value) })}
            title={document.label}
            description={document.description}
          />
        ))}
      </View>

      <View style={styles.info}>
        <Text style={styles.infoIcon}>ⓘ</Text>
        <View style={styles.infoCopy}>
          <Text style={styles.infoTitle}>지금 서류 파일을 올릴 필요는 없어요</Text>
          <Text style={styles.infoText}>준비 상태만 표시하고, 서류 원본은 저장하지 않아요.</Text>
        </View>
      </View>
    </View>
  );
}

export function DoneStep({ result }: { result: SignupResponse }) {
  const r = result.received;
  const period = r.subscriptionMonths == null ? '' : ` (${Math.floor(r.subscriptionMonths / 12)}년 ${r.subscriptionMonths % 12}개월)`;
  const rows: [string, string][] = [
    ['알림 기준 지역', r.region],
    ['생년월일', r.birthDate],
    ['가구원 수', r.householdSize === 4 ? '4명 이상' : `${r.householdSize}명`],
    ['주택 보유', labelOf(housingOptions, r.housingOwnership)],
    ['관심 공급 유형', labelsOf(supplyOptions, r.supplyTypes)],
    ['청약통장', r.hasSubscriptionAccount ? `가입${period}` : '미가입'],
    ['추가 조건', labelsOf(extraOptions, r.extraConditions)],
    ['준비한 서류', labelsOf(documentOptions, r.preparedDocuments)],
    ['알림 수신', r.notificationAgreed ? '동의' : '미동의'],
  ];

  return (
    <View>
      {rows.map(([key, value]) => (
        <View key={key} style={styles.summaryRow}>
          <Text style={styles.summaryKey}>{key}</Text>
          <Text style={styles.summaryValue}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  agreeAll: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.surface, padding: 18, marginBottom: 16 },
  agreeAllText: { color: colors.ink, fontSize: 16, fontWeight: '800', marginLeft: 13 },
  card: { borderWidth: 1, borderColor: colors.border, borderRadius: 16, backgroundColor: colors.surface, paddingHorizontal: 18, paddingVertical: 10 },
  cardTitle: { color: colors.ink, fontSize: 16, fontWeight: '800', marginTop: 8, marginBottom: 4 },
  agreeRow: { flexDirection: 'row', alignItems: 'center' },
  required: { color: colors.brand },
  optional: { color: colors.muted },
  viewLink: { color: colors.brand, fontSize: 14, fontWeight: '700', paddingLeft: 8 },
  terms: { color: colors.muted, fontSize: 12, lineHeight: 19, backgroundColor: colors.cream, borderRadius: 10, padding: 12, marginLeft: 39, marginBottom: 8 },
  locationButton: { alignSelf: 'flex-start', paddingVertical: 14 },
  locationButtonText: { color: colors.brand, fontSize: 14, fontWeight: '800' },
  note: { color: colors.muted, fontSize: 12, marginTop: 4, marginBottom: 12 },
  periodRow: { flexDirection: 'row', gap: 10, marginTop: 14, marginBottom: 6 },
  periodField: { flex: 1 },
  extraCard: { marginTop: 24, paddingVertical: 18 },
  extraToggle: { flexDirection: 'row', alignItems: 'center' },
  extraCopy: { flex: 1 },
  extraTitle: { color: colors.ink, fontSize: 16, fontWeight: '800', marginBottom: 5 },
  extraDescription: { color: colors.muted, fontSize: 13, lineHeight: 19 },
  arrow: { color: colors.muted, fontSize: 24, marginLeft: 10 },
  extraChips: { marginTop: 16 },
  info: { flexDirection: 'row', backgroundColor: colors.brandSoft, borderRadius: 16, padding: 18, marginTop: 20 },
  infoIcon: { color: colors.brand, fontSize: 18, marginRight: 10 },
  infoCopy: { flex: 1 },
  infoTitle: { color: colors.ink, fontSize: 15, fontWeight: '800', marginBottom: 5 },
  infoText: { color: '#6b5a4e', fontSize: 13, lineHeight: 19 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 13, borderBottomWidth: 1, borderBottomColor: colors.border },
  summaryKey: { color: colors.muted, fontSize: 14, marginRight: 16 },
  summaryValue: { color: colors.ink, fontSize: 14, flex: 1, textAlign: 'right' },
});
