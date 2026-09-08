/**
 * World Sound Chart - Serverless Function
 * GET /api/chart?country=US&chartType=daily&limit=20
 * GET /api/chart?type=news
 */

// フォールバック用のダミーチャートデータ（APIエラーや制限時に使用）
const DEMO_CHARTS = {
  US: [
    { title: 'A Bar Song (Tipsy)', artist: 'Shaboozey' },
    { title: 'Birds of a Feather', artist: 'Billie Eilish' },
    { title: 'Espresso', artist: 'Sabrina Carpenter' },
    { title: 'Not Like Us', artist: 'Kendrick Lamar' },
    { title: 'Please Please Please', artist: 'Sabrina Carpenter' },
    { title: 'Good Luck, Babe!', artist: 'Chappell Roan' },
    { title: 'I Had Some Help', artist: 'Post Malone ft. Morgan Wallen' },
    { title: 'Lose Control', artist: 'Teddy Swims' },
    { title: 'Too Sweet', artist: 'Hozier' },
    { title: 'Beautiful Things', artist: 'Benson Boone' }
  ],
  GB: [
    { title: 'Espresso', artist: 'Sabrina Carpenter' },
    { title: 'Please Please Please', artist: 'Sabrina Carpenter' },
    { title: '360', artist: 'Charli xcx' },
    { title: 'Birds of a Feather', artist: 'Billie Eilish' },
    { title: 'Houdini', artist: 'Dua Lipa' },
    { title: 'Good Luck, Babe!', artist: 'Chappell Roan' },
    { title: 'Stargazing', artist: 'Myles Smith' },
    { title: 'Austin', artist: 'Dasha' }
  ],
  JP: [
    { title: 'ライラック', artist: 'Mrs. GREEN APPLE' },
    { title: 'Bling-Bang-Bang-Born', artist: 'Creepy Nuts' },
    { title: '晩餐歌', artist: 'tuki.' },
    { title: '幾億光年', artist: 'Omoinotake' },
    { title: 'はいろろ', artist: 'Vaundy' },
    { title: '怪獣のサイズ', artist: 'Mrs. GREEN APPLE' },
    { title: 'アイドル', artist: 'YOASOBI' },
    { title: '唱', artist: 'Ado' }
  ],
  KR: [
    { title: 'Supernova', artist: 'aespa' },
    { title: 'How Sweet', artist: 'NewJeans' },
    { title: 'Magnetic', artist: 'ILLIT' },
    { title: 'SPOT!', artist: 'ZICO ft. JENNIE' }
  ]
};

// フォールバック用のニュースデータ
const DEMO_NEWS = [
  { title: 'Billboard: グローバルストリーミングチャート最新更新', url: 'https://www.billboard.com' },
  { title: 'NME: 今週の世界の注目のニューリリース・ヒット曲', url: 'https://www.nme.com' },
  { title: 'Official Charts: 各国デイリーランキング＆トレンド分析', url: 'https://www.officialcharts.com' }
];

export default async function handler(req, res) {
  // CORSヘッダーの設定
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { country = 'US', chartType = 'daily', limit = 20, type } = req.query;

  try {
    // 1. ニュースティッカー用データのリクエスト判定
    if (type === 'news') {
      const newsData = await fetchMusicNews();
      return res.status(200).json({ news: newsData });
    }

    // 2. チャートデータのリクエスト処理
    const countryCode = String(country).toUpperCase();
    const tracks = await fetchChartData(countryCode, chartType, parseInt(limit, 10));

    return res.status(200).json({
      country: countryCode,
      chartType,
      updatedAt: new Date().toISOString(),
      tracks
    });

  } catch (error) {
    console.error('API Processing Error:', error);
    
    // エラー発生時も500で落とさず、フォールバックデータを返してフロントエンドを維持
    const fallbackList = DEMO_CHARTS[country.toUpperCase()] || DEMO_CHARTS['US'];
    const tracks = fallbackList.map((item, index) => ({
      rank: index + 1,
      title: item.title,
      artist: item.artist,
      img: null,
      url: `https://open.spotify.com/search/${encodeURIComponent(item.title + ' ' + item.artist)}`
    }));

    return res.status(200).json({
      country: country.toUpperCase(),
      fallback: true,
      tracks
    });
  }
}

/**
 * 国・種類に応じたチャートデータ取得関数
 */
async function fetchChartData(countryCode, chartType, limit) {
  // ※実際の外部サービス連携API（Spotify APIやBillboard APIなど）を呼び出す処理をここに配置します。
  // 現在はフォールバック用データを元にレスポンス構造を統一して返却します。
  const baseList = DEMO_CHARTS[countryCode] || DEMO_CHARTS['US'];
  
  return baseList.slice(0, limit).map((item, index) => ({
    rank: index + 1,
    title: item.title,
    artist: item.artist,
    img: null, // 画像URL（Spotify API連携時に設定）
    url: `https://open.spotify.com/search/${encodeURIComponent(item.title + ' ' + item.artist)}`
  }));
}

/**
 * 音楽ニュース（RSS）取得関数
 */
async function fetchMusicNews() {
  // RSSフィード解析処理（例: rss-parser等のライブラリを利用）
  // 実装簡略化のためデモ配列を返却
  return DEMO_NEWS;
}
