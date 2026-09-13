import { useEffect, useMemo, useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { colors } from '../theme';
import { Coordinates } from '../types/housing';

type Props = {
  visible: boolean;
  initialCoordinates: Coordinates;
  onClose: () => void;
  onSelect: (selection: Coordinates & { label: string }) => void;
};

function getJavaScriptKey() {
  return process.env.EXPO_PUBLIC_KAKAO_JAVASCRIPT_KEY || process.env.KAKAO_JAVASCRIPT_KEY || '';
}

export function MapLocationPicker({ visible, initialCoordinates, onClose, onSelect }: Props) {
  const [mapError, setMapError] = useState('');

  useEffect(() => {
    if (visible) setMapError('');
  }, [visible]);

  const mapHtml = useMemo(() => {
    const key = getJavaScriptKey();
    return `<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>html,body,#map{width:100%;height:100%;margin:0}#hint{position:fixed;z-index:2;top:14px;left:50%;transform:translateX(-50%);background:#fff;padding:10px 14px;border-radius:18px;font:600 13px sans-serif;color:#1d1d1d;box-shadow:0 2px 10px #0002;white-space:nowrap}#error{display:none;position:fixed;z-index:3;top:70px;left:20px;right:20px;background:#fff4ed;border:1px solid #f1b18c;border-radius:14px;padding:14px;color:#8b4827;font:13px sans-serif;line-height:20px}</style><script>window.kakaoSdkLoaded=false;function send(message){if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(JSON.stringify(message));}}function showError(message){document.getElementById('error').style.display='block';document.getElementById('error').textContent=message;send({type:'error',message});}window.onerror=function(){showError('카카오 지도 SDK를 불러오지 못했어요. JavaScript 키의 Web 플랫폼 설정을 확인해주세요.');};</script><script src="https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&libraries=services&autoload=false" onload="window.kakaoSdkLoaded=true"></script></head><body><div id="hint">지도를 눌러 지역을 선택하세요</div><div id="error"></div><div id="map"></div><script>const start={lat:${initialCoordinates.latitude},lng:${initialCoordinates.longitude}};if(!'${key}'){showError('EXPO_PUBLIC_KAKAO_JAVASCRIPT_KEY가 없습니다.');}else{setTimeout(function(){if(!window.kakaoSdkLoaded||!window.kakao){showError('카카오 지도 SDK가 로드되지 않았어요. JavaScript 키의 Web 플랫폼에 https://localhost를 등록했는지 확인해주세요.');return;}kakao.maps.load(function(){const map=new kakao.maps.Map(document.getElementById('map'),{center:new kakao.maps.LatLng(start.lat,start.lng),level:7});const marker=new kakao.maps.Marker({position:map.getCenter()});marker.setMap(map);const geocoder=new kakao.maps.services.Geocoder();kakao.maps.event.addListener(map,'click',function(mouseEvent){const latlng=mouseEvent.latLng;marker.setPosition(latlng);geocoder.coord2RegionCode(latlng.getLng(),latlng.getLat(),function(result,status){if(status===kakao.maps.services.Status.OK){const region=result.find((item)=>item.region_type==='H')||result[0];const label=region.region_1depth_name==='서울특별시'?region.region_1depth_name+' '+region.region_2depth_name:region.region_1depth_name+' '+region.region_2depth_name;send({type:'select',latitude:latlng.getLat(),longitude:latlng.getLng(),label});}}});});},1500);}</script></body></html>`;
  }, [initialCoordinates]);

  function handleMessage(event: WebViewMessageEvent) {
    try {
      const message = JSON.parse(event.nativeEvent.data) as Coordinates & { type: string; label?: string; message?: string };
      if (message.type === 'select') onSelect({ latitude: message.latitude, longitude: message.longitude, label: message.label || '선택한 지역' });
      if (message.type === 'error') setMapError(message.message || '카카오 지도 SDK 오류가 발생했어요.');
    } catch {
      // Ignore malformed WebView messages.
    }
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}><View><Text style={styles.eyebrow}>LOCATION</Text><Text style={styles.title}>청약 지역 선택</Text></View></View>
        {Platform.OS === 'web' ? <View style={styles.webFallback}><Text style={styles.fallbackTitle}>지도 선택은 Expo Go에서 확인해주세요.</Text><Text style={styles.fallbackText}>웹에서는 카카오 지도 플랫폼 설정에 등록된 도메인이 필요합니다.</Text><Pressable onPress={onClose} style={styles.fallbackButton}><Text style={styles.fallbackButtonText}>돌아가기</Text></Pressable></View> : <View style={styles.mapWrap}><WebView originWhitelist={['*']} source={{ html: mapHtml, baseUrl: 'https://localhost/' }} onMessage={handleMessage} javaScriptEnabled domStorageEnabled mixedContentMode="always" onHttpError={() => setMapError('카카오 지도 서버 응답을 확인하지 못했어요.')} onError={() => setMapError('카카오 지도 페이지를 불러오지 못했어요.')} style={styles.map} />{mapError ? <View style={styles.errorCard}><Text style={styles.errorTitle}>지도를 불러오지 못했어요</Text><Text style={styles.errorText}>{mapError}</Text><Text style={styles.errorText}>카카오 개발자 콘솔에서 JavaScript 키의 Web 플랫폼에 https://localhost를 등록했는지 확인해주세요.</Text><Text style={styles.errorText}>Expo를 완전히 종료한 뒤 npx expo start -c로 다시 실행해주세요.</Text></View> : null}</View>}
        <View style={styles.footer}><Text style={styles.footerText}>지도를 누르면 서울은 구, 그 외 지역은 시 단위로 선택됩니다.</Text><Pressable onPress={onClose} style={styles.closeButton}><Text style={styles.closeButtonText}>닫기</Text></Pressable></View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  header: { backgroundColor: colors.surface, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  eyebrow: { color: colors.orange, fontSize: 11, fontWeight: '800', marginBottom: 4 },
  title: { color: colors.ink, fontSize: 21, fontWeight: '800' },
  map: { flex: 1 },
  mapWrap: { flex: 1 },
  footer: { backgroundColor: colors.surface, paddingHorizontal: 14, paddingTop: 12, paddingBottom: 20, alignItems: 'center' },
  footerText: { color: colors.muted, fontSize: 12, textAlign: 'center' },
  closeButton: { backgroundColor: colors.ink, borderRadius: 22, minWidth: 150, height: 44, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  closeButtonText: { color: colors.surface, fontSize: 14, fontWeight: '800' },
  webFallback: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  fallbackTitle: { color: colors.ink, fontSize: 17, fontWeight: '800', marginBottom: 8, textAlign: 'center' },
  fallbackText: { color: colors.muted, fontSize: 13, lineHeight: 20, textAlign: 'center' },
  fallbackButton: { backgroundColor: colors.ink, borderRadius: 20, paddingHorizontal: 18, paddingVertical: 10, marginTop: 18 },
  fallbackButtonText: { color: colors.surface, fontSize: 13, fontWeight: '700' },
  errorCard: { position: 'absolute', left: 20, right: 20, top: 24, backgroundColor: colors.surface, borderRadius: 16, padding: 16, shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, elevation: 3 },
  errorTitle: { color: colors.ink, fontSize: 15, fontWeight: '800', marginBottom: 7 },
  errorText: { color: colors.muted, fontSize: 12, lineHeight: 18 },
});
