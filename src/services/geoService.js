export const obterLocalizacaoAtual = () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve({ lat: -7.0142, lon: -37.2910, origem: 'Patos-PB (Default)' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          origem: 'GPS Real do Dispositivo'
        });
      },
      () => {
        resolve({ lat: -7.0142, lon: -37.2910, origem: 'Patos-PB (Fallback)' });
      },
      { timeout: 5000, enableHighAccuracy: true }
    );
  });
};
