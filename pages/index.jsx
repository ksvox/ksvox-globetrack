import { useEffect } from 'react';
import Head from 'next/head';

const APP_URL = 'https://globetrack.ksvox.net';
const SHOWCASE_URL = 'https://showcase.ksvox.net/';

export default function Home() {
  useEffect(() => {
    const COUNTRIES = {
      US: { name: 'アメリカ', flag: '🇺🇸', coords: [38.0, -97.0], topSong: '読み込み中...', offsetX: 0, offsetY: -35 },
      GB: { name: 'イギリス', flag: '🇬🇧', coords: [55.0, -3.5], topSong: '読み込み中...', offsetX: -30, offsetY: -45 },
      FR: { name: 'フランス', flag: '🇫🇷', coords: [46.2, 2.2], topSong: '読み込み中...', offsetX: -45, offsetY: 15 },
      DE: { name: 'ドイツ', flag: '🇩🇪', coords: [51.1, 10.4], topSong: '読み込み中...', offsetX: 40, offsetY: -35 },
      RU: { name: 'ロシア', flag: '🇷🇺', coords: [60.0, 95.0], topSong: '読み込み中...', offsetX: 0, offsetY: -30 },
      IN: { name: 'インド', flag: '🇮🇳', coords: [22.0, 79.0], topSong: '読み込み中...', offsetX: -15, offsetY: 20 },
      JP: { name: '日本', flag: '🇯🇵', coords: [36.2, 138.2], topSong: '読み込み中...', offsetX: 40, offsetY: -25 },
      KR: { name: '韓国', flag: '🇰🇷', coords: [35.9, 127.7], topSong: '読み込み中...', offsetX: -45, offsetY: 20 },
      ZA: { name: '南アフリカ', flag: '🇿🇦', coords: [-29.0, 24.0], topSong: '読み込み中...', offsetX: 0, offsetY: 15 },
      BR: { name: 'ブラジル', flag: '🇧🇷', coords: [-14.2, -51.9], topSong: '読み込み中...', offsetX: 0, offsetY: 15 },
      AU: { name: '豪州', flag: '🇦🇺', coords: [-25.2, 133.7], topSong: '読み込み中...', offsetX: 0, offsetY: 15 },
    };

    const PLAYLISTS = [
      '2Zt73pxrTMb1qlkEE8Qdjs',
      '5mvDPiR6GMEFUi3rWJChkM',
      '0StVUsKroCwy1VJqcEyxAg',
      '1iq8aGjJIf6WLi0FKwVnpi',
      '3BF3U2DlkX8NLj80bczC35',
      '4YGN3eQOtBnr82Ag21b3Ia',
    ];

    // ---------- 国別プロフィール(固定情報) ----------
    const COUNTRY_INFO = {
      JP: { tz: 'Asia/Tokyo', capital: '東京', lang: '日本語', hello: 'こんにちは', helloNative: '', foods: '寿司/天ぷら/しゃぶしゃぶ' },
      KR: { tz: 'Asia/Seoul', capital: 'ソウル', lang: '韓国語', hello: 'アンニョンハセヨ', helloNative: '안녕하세요', foods: 'ビビンバ/キムチ/サムギョプサル' },
      AU: { tz: 'Australia/Sydney', capital: 'キャンベラ', lang: '英語', hello: 'グッダイ', helloNative: "G'day", foods: 'ミートパイ/BBQ/ラミントン' },
      IN: { tz: 'Asia/Kolkata', capital: 'ニューデリー', lang: 'ヒンディー語・英語 ほか', hello: 'ナマステ', helloNative: 'नमस्ते', foods: 'カレー/ビリヤニ/ナン' },
      RU: { tz: 'Europe/Moscow', capital: 'モスクワ', lang: 'ロシア語', hello: 'ズドラーストヴィチェ', helloNative: 'Здравствуйте', foods: 'ペリメニ/ピロシキ/ビーフストロガノフ' },
      ZA: { tz: 'Africa/Johannesburg', capital: 'プレトリア', lang: '英語・ズールー語など12言語', hello: 'サウボナ', helloNative: 'Sawubona', foods: 'ブラーイ/ボボティ/ビルトン' },
      DE: { tz: 'Europe/Berlin', capital: 'ベルリン', lang: 'ドイツ語', hello: 'グーテン・ターク', helloNative: 'Guten Tag', foods: 'ソーセージ/ザワークラウト/プレッツェル' },
      FR: { tz: 'Europe/Paris', capital: 'パリ', lang: 'フランス語', hello: 'ボンジュール', helloNative: 'Bonjour', foods: 'ブフ・ブルギニョン/キッシュ/クロワッサン' },
      GB: { tz: 'Europe/London', capital: 'ロンドン', lang: '英語', hello: 'ハロー', helloNative: 'Hello', foods: 'フィッシュ&チップス/ローストビーフ/スコーン' },
      BR: { tz: 'America/Sao_Paulo', capital: 'ブラジリア', lang: 'ポルトガル語', hello: 'オラ', helloNative: 'Olá', foods: 'フェイジョアーダ/シュラスコ/ポン・デ・ケージョ' },
      US: { tz: 'America/New_York', capital: 'ワシントンD.C.', lang: '英語', hello: 'ハーイ', helloNative: 'Hi', foods: 'ハンバーガー/ホットドッグ/BBQリブ' },
    };
    // 複数の時間帯がある国は「首都の時刻」と表示
    const MULTI_TZ = ['US', 'RU', 'AU', 'BR'];

    // 世界一周:日本から東回り
    const TOUR_ORDER = ['JP', 'KR', 'AU', 'IN', 'RU', 'ZA', 'DE', 'FR', 'GB', 'BR', 'US'];
    const TOUR_ZOOM = { JP: 5, KR: 5, AU: 3, IN: 4, RU: 3, ZA: 4, DE: 5, FR: 5, GB: 5, BR: 3, US: 3 };
    const DEFAULT_VIEW = [
      [-50, -130],
      [65, 150],
    ];

    // ジャンル名の日本語化(AppleのジャンルID → 日本語)
    const GENRE_BY_ID = {
      14: 'ポップ', 18: 'ヒップホップ', 17: 'ダンス', 7: 'エレクトロ', 21: 'ロック', 20: 'オルタナ', 15: 'R&B',
      6: 'カントリー', 12: 'ラテン', 16: 'サウンドトラック', 24: 'レゲエ', 27: 'J-POP', 51: 'K-POP', 29: 'アニメ',
      28: '演歌', 19: 'ワールド', 10: 'シンガーソングライター', 11: 'ジャズ', 5: 'クラシック', 2: 'ブルース',
      22: 'ゴスペル', 30: 'ブラジル音楽', 1262: 'インド音楽', 1263: 'ボリウッド', 1264: 'インド音楽', 1265: 'インド音楽',
      1266: 'インド音楽', 1267: 'インド音楽', 1268: 'インド音楽', 1269: 'インド音楽',
    };
    // 国ごとのApple表記(英語・ロシア語など)で来た名前の日本語化
    const GENRE_BY_NAME = {
      'pop': 'ポップ', 'hip-hop/rap': 'ヒップホップ', 'hip-hop': 'ヒップホップ', 'rap': 'ラップ', 'dance': 'ダンス',
      'electronic': 'エレクトロ', 'rock': 'ロック', 'alternative': 'オルタナ', 'r&b/soul': 'R&B', 'country': 'カントリー',
      'latin': 'ラテン', 'soundtrack': 'サウンドトラック', 'reggae': 'レゲエ', 'k-pop': 'K-POP', 'j-pop': 'J-POP',
      'bollywood': 'ボリウッド', 'indian pop': 'インディアンポップ', 'punjabi': 'パンジャービー', 'indian': 'インド音楽',
      'amapiano': 'アマピアノ', 'afrobeats': 'アフロビーツ', 'afro house': 'アフロハウス', 'afro-pop': 'アフロポップ',
      'african': 'アフリカ音楽', 'house': 'ハウス', 'sertanejo': 'セルタネージョ', 'funk': 'ファンキ', 'mpb': 'MPB',
      'pagode': 'パゴーヂ', 'schlager': 'シュラーガー', 'variété française': 'フレンチポップ', 'rap français': 'フレンチラップ',
      'поп': 'ポップ', 'хип-хоп': 'ヒップホップ', 'хип-хоп/рэп': 'ヒップホップ', 'рэп': 'ラップ', 'танцевальная': 'ダンス',
      'электроника': 'エレクトロ', 'рок': 'ロック', 'альтернатива': 'オルタナ', 'хаус': 'ハウス', 'шансон': 'シャンソン',
      'русский шансон': 'ロシアン・シャンソン', 'r&b/соул': 'R&B',
    };
    const GENRE_COLORS = ['#1DB954', '#F5B8D5', '#60a5fa'];

    function trackGenre(t) {
      const list = t.genres || [];
      for (const g of list) {
        const byName = GENRE_BY_NAME[String(g.name || '').toLowerCase()];
        if (byName) return byName;
        if (GENRE_BY_ID[g.id]) return GENRE_BY_ID[g.id];
      }
      return list[0]?.name || 'その他';
    }

    // その国のランキングで多いジャンル上位3つ
    function genreSummary(tracks) {
      const counts = {};
      (tracks || []).slice(0, 10).forEach((t) => {
        const g = trackGenre(t);
        counts[g] = (counts[g] || 0) + 1;
      });
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      const top = Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3)
        .map(([name, n], i) => ({ name, n, color: GENRE_COLORS[i] }));
      return { top, total };
    }

    function localTime(tz) {
      try {
        const parts = new Intl.DateTimeFormat('ja-JP', { timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).formatToParts(new Date());
        const h = Number(parts.find((p) => p.type === 'hour')?.value || 0);
        const m = parts.find((p) => p.type === 'minute')?.value || '00';
        const label = h < 5 ? '深夜' : h < 10 ? '朝' : h < 16 ? '昼' : h < 19 ? '夕方' : '夜';
        return { hm: `${String(h).padStart(2, '0')}:${m}`, label };
      } catch (e) {
        return { hm: '--:--', label: '' };
      }
    }
    const clockHtml = (tz) => {
      const t = localTime(tz);
      return `${t.hm} <span class="text-[11px] text-zinc-400 font-medium">${t.label}</span>`;
    };
    // 表示中の現地時刻を20秒ごとに更新
    const clockTimer = setInterval(() => {
      document.querySelectorAll('.gt-localtime').forEach((el) => {
        if (el.dataset.tz) el.innerHTML = clockHtml(el.dataset.tz);
      });
    }, 20000);

    function genreHtml(tracks) {
      if (!tracks || !tracks.length) return `<div class="text-[11px] text-zinc-500">集計中…</div>`;
      const { top, total } = genreSummary(tracks);
      const bar = top
        .map((g) => `<div style="width:${(g.n / total) * 100}%;background:${g.color}"></div>`)
        .join('');
      const legend = top
        .map((g) => `<span class="mr-2.5 whitespace-nowrap"><span style="color:${g.color}">●</span> ${escapeHtml(g.name)} ${g.n}曲</span>`)
        .join('');
      return `<div class="flex h-2.5 rounded-full overflow-hidden bg-zinc-800">${bar}</div><div class="mt-1.5 text-[11px] text-zinc-300 flex flex-wrap">${legend}</div>`;
    }

    // 国別プロフィールカード(ランキング画面の上部)
    function profileHtml(code, tracks) {
      const c = COUNTRIES[code];
      const info = COUNTRY_INFO[code];
      if (!c || !info) return '';
      const timeTitle = MULTI_TZ.includes(code) ? '現地時間(首都)' : '現地時間';
      return `
        <div class="rounded-2xl bg-zinc-900 border border-zinc-800 p-3.5 mb-1">
          <div class="flex items-baseline justify-between mb-2">
            <span class="text-[11px] text-zinc-400"><i class="fa-regular fa-clock mr-1"></i>${timeTitle}</span>
            <span class="gt-localtime text-xl font-extrabold text-white" data-tz="${info.tz}">${clockHtml(info.tz)}</span>
          </div>
          <div class="mb-3">
            <span class="text-base font-extrabold" style="color:#F5B8D5">${escapeHtml(info.hello)}!</span>
            ${info.helloNative ? `<span class="ml-1.5 text-[11px] text-zinc-400">${escapeHtml(info.helloNative)}</span>` : ''}
          </div>
          <div class="grid grid-cols-2 gap-1.5 text-[11px]">
            <div class="rounded-lg bg-zinc-800/80 px-2.5 py-1.5"><div class="text-zinc-400">首都</div><div class="text-white font-bold">${escapeHtml(info.capital)}</div></div>
            <div class="rounded-lg bg-zinc-800/80 px-2.5 py-1.5"><div class="text-zinc-400">公用語</div><div class="text-white font-bold">${escapeHtml(info.lang)}</div></div>
            <div class="rounded-lg bg-zinc-800/80 px-2.5 py-1.5 col-span-2"><div class="text-zinc-400">代表的な料理</div><div class="text-white font-bold">${escapeHtml(info.foods)}</div></div>
          </div>
          <div class="mt-3">
            <div class="text-[11px] text-zinc-400 mb-1.5">今流行っているジャンル</div>
            ${genreHtml(tracks)}
          </div>
        </div>
        <div class="pt-2 pb-0.5 text-[11px] font-bold text-zinc-400">${c.flag} 今聴かれている曲 Top 10</div>`;
    }

    // 🌍バッジを付ける基準(何カ国以上のTop10に入っていたら付けるか)
    const GLOBAL_HIT_MIN = 3;

    let map = null;
    let currentPlaylistIdx = 0;
    let playlistTimer = null;

    // 地図の国のTop10(吹き出し・ランキング表示・🌍バッジ判定で共通利用)
    const nowChartCache = {};
    // ボトムシートに今表示している内容
    let currentTracks = [];
    let currentCountryCode = 'US';
    let currentMode = 'now';
    // 「もう一度読み込む」用に、直前に開いた内容を覚えておく
    let lastRequest = null;

    // 試聴プレーヤー(1つだけを使い回す)
    const audio = new Audio();
    audio.preload = 'none';
    let playingIdx = -1;

    const escapeHtml = (str) =>
      String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

    const openSheet = () => document.getElementById('ranking-sheet')?.classList.replace('closed', 'open');
    const closeSheet = () => {
      document.getElementById('ranking-sheet')?.classList.replace('open', 'closed');
      stopPreview();
    };

    // ---------- 小さなお知らせ表示 ----------
    let toastTimer = null;
    function showToast(msg) {
      const el = document.getElementById('gt-toast');
      if (!el) return;
      el.textContent = msg;
      el.classList.remove('opacity-0');
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => el.classList.add('opacity-0'), 2200);
    }

    // ---------- K's VOX プレイリスト枠 ----------
    function initPlaylists() {
      const container = document.getElementById('playlist-container');
      if (!container) return;
      container.innerHTML = PLAYLISTS.map(
        (id) => `
                <div class="snap-center shrink-0 w-[90%]">
                    <iframe src="https://open.spotify.com/embed/playlist/${id}?utm_source=generator&theme=0" width="100%" height="80" frameborder="0" allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" loading="lazy" class="rounded-xl"></iframe>
                </div>
            `
      ).join('');
      startPlaylistAutoScroll();
    }

    function startPlaylistAutoScroll() {
      const container = document.getElementById('playlist-container');
      if (!container) return;
      const advance = () => {
        currentPlaylistIdx = (currentPlaylistIdx + 1) % PLAYLISTS.length;
        const items = container.querySelectorAll('.snap-center');
        if (items[currentPlaylistIdx]) {
          container.scrollTo({ left: items[currentPlaylistIdx].offsetLeft, behavior: 'smooth' });
        }
      };
      playlistTimer = setInterval(advance, 3000);
      container.addEventListener('touchstart', () => clearInterval(playlistTimer), { passive: true });
      container.addEventListener(
        'touchend',
        () => {
          clearInterval(playlistTimer);
          playlistTimer = setInterval(advance, 3000);
        },
        { passive: true }
      );
    }

    // ---------- ニュースティッカー ----------
    async function fetchMusicNews() {
      const tickerEl = document.getElementById('news-ticker-text');
      let items = [];
      try {
        const res = await fetch('/api/news');
        if (res.ok) items = (await res.json()).items || [];
      } catch (e) {}
      if (!tickerEl) return;

      if (items.length) {
        items.sort(() => Math.random() - 0.5);
        const headlines = items
          .map(
            (i) =>
              `📰 [${escapeHtml(i.source)}] <a href="${escapeHtml(i.link)}" target="_blank" rel="noopener noreferrer">${escapeHtml(
                i.title
              )}</a>`
          )
          .join(' &nbsp;&nbsp;&nbsp;&nbsp; ');
        tickerEl.innerHTML = `<span>${headlines} &nbsp;&nbsp;&nbsp;&nbsp;</span><span>${headlines} &nbsp;&nbsp;&nbsp;&nbsp;</span>`;
        // 件数が多いほどゆっくり流す(読みやすさ維持)
        tickerEl.style.animationDuration = `${Math.max(45, items.length * 7)}s`;
      } else {
        tickerEl.innerHTML = `<span>🎵 洋楽・来日公演・新作情報を更新中！ &nbsp;&nbsp;&nbsp;&nbsp;</span>`;
      }
    }

    // ---------- 地図 ----------
    function initMap() {
      if (map || typeof window.L === 'undefined') return;
      const L = window.L;
      const bounds = L.latLngBounds(L.latLng(-70, -180), L.latLng(85, 180));
      map = L.map('map', {
        zoomControl: false,
        attributionControl: false,
        minZoom: 1,
        maxZoom: 7,
        maxBounds: bounds,
        maxBoundsViscosity: 1.0,
      });
      L.tileLayer('https://services.arcgisonline.com/arcgis/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 16,
        noWrap: true,
        bounds,
      }).addTo(map);
      map.fitBounds(L.latLngBounds(L.latLng(-50, -130), L.latLng(65, 150)), { padding: [10, 10] });

      Object.keys(COUNTRIES).forEach((code) => {
        const c = COUNTRIES[code];
        const iconHtml = `
                    <div class="relative flex flex-col items-center cursor-pointer">
                        <div class="speech-bubble px-2 py-1 rounded-lg bg-zinc-900/95 border border-spotify-green text-[9px] font-bold text-white mb-1 whitespace-nowrap flex items-center space-x-1" style="transform: translate(${c.offsetX}px, ${c.offsetY}px);">
                            <span>${c.flag}</span><span class="text-spotify-green font-extrabold">1位:</span>
                            <span id="bubble-song-${code}" class="truncate max-w-[65px]">${escapeHtml(c.topSong)}</span>
                        </div>
                        <div class="w-5 h-5 rounded-full bg-spotify-green/30 border-2 border-spotify-green pulse-glow-pin flex items-center justify-center -mt-2">
                            <div class="w-2 h-2 rounded-full bg-spotify-green"></div>
                        </div>
                    </div>`;

        L.marker(c.coords, { icon: L.divIcon({ html: iconHtml, className: '', iconSize: [80, 40], iconAnchor: [40, 20] }) })
          .addTo(map)
          .on('click', () => {
            if (touring) pauseTour();
            fetchChart(code, 'now', '今聴かれている曲 Top 10', 10);
          });
      });

      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 300);
      preloadTopSongs();
    }

    // 全カ国を一斉に取りに行き、届いた国から順に吹き出しへ表示する(全部そろうのを待たない)
    // 地図上部の「集計中… ○/11」表示
    const TOTAL_COUNTRIES = Object.keys(COUNTRIES).length;
    let loadedCount = 0;
    function updateProgress() {
      const box = document.getElementById('load-progress');
      const num = document.getElementById('load-progress-num');
      if (num) num.textContent = `${loadedCount}/${TOTAL_COUNTRIES}`;
      if (box && loadedCount >= TOTAL_COUNTRIES) {
        const label = document.getElementById('load-progress-label');
        if (label) label.textContent = '集計完了！';
        setTimeout(() => {
          box.style.opacity = '0';
          setTimeout(() => {
            box.style.display = 'none';
          }, 500);
        }, 900);
      }
    }

    // ---------- ランキング取得(自動リトライ付き) ----------
    const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

    // 失敗しても1秒・2秒と間をあけて、最大3回まで取りに行く
    async function fetchTracksWithRetry(code, limit) {
      const waits = [0, 1000, 2000];
      for (const w of waits) {
        if (w) await sleep(w);
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 10000);
        try {
          const res = await fetch(`/api/chart?country=${code}&limit=${limit}`, { signal: controller.signal });
          if (res.ok) {
            const data = await res.json();
            if (data.tracks?.length) return data.tracks;
          }
        } catch (e) {
        } finally {
          clearTimeout(timer);
        }
      }
      return [];
    }

    // 地図の国のTop10。同じ国を二重に取りに行かないよう、取得中ならその結果を待つ
    const inflight = {};
    function loadCountry(code) {
      if (nowChartCache[code]) return Promise.resolve(nowChartCache[code]);
      if (inflight[code]) return inflight[code];
      inflight[code] = fetchTracksWithRetry(code, 10)
        .then((tracks) => {
          if (tracks.length) {
            nowChartCache[code] = tracks;
            updateBubbleSong(code, tracks[0].title);
          } else if (!nowChartCache[code]) {
            updateBubbleSong(code, '—');
          }
          return tracks;
        })
        .finally(() => {
          delete inflight[code];
        });
      return inflight[code];
    }

    function preloadTopSongs() {
      loadedCount = 0;
      updateProgress();
      Object.keys(COUNTRIES).forEach((code) => {
        loadCountry(code).finally(() => {
          loadedCount++;
          updateProgress();
        });
      });
    }

    function updateBubbleSong(code, title) {
      if (COUNTRIES[code]) COUNTRIES[code].topSong = title;
      const el = document.getElementById(`bubble-song-${code}`);
      if (el) el.textContent = title;
    }

    // ---------- 🌍 複数国ランクイン判定 ----------
    const norm = (s) =>
      String(s || '')
        .toLowerCase()
        .replace(/\(.*?\)|\[.*?\]/g, '')
        .replace(/\s-\s.*$/, '')
        .replace(/[^\p{L}\p{N}]/gu, '');
    const firstArtist = (a) => norm(String(a || '').split(/,|&|\sfeat\.?|\sft\.?|\sx\s|、/i)[0]);
    const songKey = (t) => `${norm(t.title)}|${firstArtist(t.artist)}`;

    function countCountries(track) {
      let n = 0;
      const key = songKey(track);
      Object.keys(nowChartCache).forEach((code) => {
        const list = nowChartCache[code] || [];
        if (list.some((x) => x.id === track.id || songKey(x) === key)) n++;
      });
      return n;
    }

    // ---------- ランキング表示 ----------
    async function fetchChart(code, mode = 'now', displayTitle = '', limit = 10) {
      stopPreview();
      const country = COUNTRIES[code] || COUNTRIES.US;
      currentCountryCode = code;
      currentMode = mode;
      currentTracks = [];

      const flagEl = document.getElementById('sheet-flag');
      const titleEl = document.getElementById('sheet-title');
      if (flagEl) flagEl.textContent = country.flag;
      if (titleEl) titleEl.textContent = mode === 'now' ? country.name : `${country.name} ${displayTitle}`;
      const ytLegend = document.getElementById('legend-youtube');
      if (ytLegend) ytLegend.style.display = mode === 'top20' ? '' : 'none';
      openSheet();

      const container = document.getElementById('song-list-container');
      const profile = mode === 'now' ? profileHtml(code, nowChartCache[code]) : '';
      if (container) {
        container.scrollTop = 0;
        container.innerHTML = profile + `<div class="flex flex-col items-center justify-center py-12 space-y-3"><div class="w-7 h-7 border-2 border-spotify-green border-t-transparent rounded-full animate-spin"></div><p class="text-xs text-zinc-300 font-bold text-center leading-relaxed">只今最新情報を取得中…<br><span class="text-zinc-400 font-medium">少しだけお待ちください</span></p></div>`;
      }

      lastRequest = [code, mode, displayTitle, limit];

      let tracks = [];
      if (mode === 'now') {
        tracks = await loadCountry(code);
      } else {
        tracks = await fetchTracksWithRetry(code, limit);
      }

      // 取得中に別の国が開かれていたら表示しない
      if (currentCountryCode !== code || currentMode !== mode) return;

      if (tracks.length) {
        renderTracks(tracks);
        return;
      }

      if (container) {
        container.innerHTML = profile + `<div class="flex flex-col items-center py-12 space-y-3 text-center"><p class="text-xs text-zinc-400 leading-relaxed">ランキングを取得できませんでした。<br>時間をおいて再度お試しください。</p><button type="button" data-action="retry" class="px-4 py-2 rounded-full bg-spotify-green/20 text-spotify-green text-xs font-bold active:scale-95 transition-transform"><i class="fa-solid fa-rotate-right mr-1"></i>もう一度読み込む</button></div>`;
      }
    }
    window.fetchChart = fetchChart;

    function renderTracks(tracks) {
      currentTracks = tracks;
      const container = document.getElementById('song-list-container');
      if (!container) return;

      const profile = currentMode === 'now' ? profileHtml(currentCountryCode, tracks) : '';
      container.innerHTML = profile + tracks
        .map((t, idx) => {
          const rank = t.rank || idx + 1;
          const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="#181818"/><circle cx="150" cy="150" r="100" fill="#1DB954"/><text x="150" y="165" font-size="48" fill="#fff" text-anchor="middle">No.${rank}</text></svg>`;
          const fallbackImg = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
          const q = encodeURIComponent(`${t.title} ${t.artist}`);
          const isGlobal = countCountries(t) >= GLOBAL_HIT_MIN;

          const ytBtn =
            currentMode === 'top20'
              ? `<a href="https://www.youtube.com/results?search_query=${q}" target="_blank" rel="noopener noreferrer" aria-label="YouTube動画" class="gt-btn" style="color:#FF0033;background:rgba(255,0,51,0.14)"><i class="fa-brands fa-youtube"></i></a>`
              : '';

          return `
                <div class="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80">
                    <div class="flex items-center space-x-3 min-w-0 flex-1">
                        <span class="w-6 h-6 rounded flex items-center justify-center text-xs font-extrabold shrink-0 ${
                          rank <= 3 ? 'rank-' + rank : 'rank-other'
                        }">${rank}</span>
                        <img src="${t.img || fallbackImg}" onerror="this.src='${fallbackImg}';" class="w-10 h-10 rounded-lg object-cover bg-zinc-800 shrink-0" />
                        <div class="min-w-0 flex-1">
                            <h4 class="text-xs font-bold text-white truncate">${isGlobal ? '<span class="mr-0.5">🌍</span>' : ''}${escapeHtml(t.title)}</h4>
                            <p class="text-[11px] text-zinc-400 truncate">${escapeHtml(t.artist)}</p>
                        </div>
                    </div>
                    <div class="flex items-center space-x-1.5 ml-2 shrink-0">
                        <button type="button" data-action="play" data-idx="${idx}" aria-label="Apple Musicで試聴" class="gt-btn" style="color:#fff;background:rgba(250,45,72,0.85)"><i class="fa-solid fa-play"></i></button>
                        <a href="https://open.spotify.com/search/${q}" target="_blank" rel="noopener noreferrer" aria-label="Spotifyで再生" class="gt-btn" style="color:#1DB954;background:rgba(29,185,84,0.16)"><i class="fa-brands fa-spotify"></i></a>
                        ${ytBtn}
                    </div>
                </div>`;
        })
        .join('');

      prefetchPreviews(tracks, currentCountryCode);
    }

    // ランキングを開いたら、裏で試聴音源の場所をまとめて取得しておく(▶を押した時すぐ鳴るように)
    async function prefetchPreviews(tracks, code) {
      const need = tracks.filter((t) => !t.previewUrl && t.id);
      if (!need.length) return;
      try {
        const r = await fetch(`/api/preview?ids=${need.map((t) => t.id).join(',')}&country=${code}`);
        if (!r.ok) return;
        const previews = (await r.json()).previews || {};
        need.forEach((t) => {
          if (previews[t.id]) t.previewUrl = previews[t.id];
        });
      } catch (e) {}
    }

    // ---------- 試聴 ----------
    function setPlayIcon(idx, playing) {
      const btn = document.querySelector(`[data-action="play"][data-idx="${idx}"] i`);
      if (btn) btn.className = playing ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    }

    function stopPreview() {
      if (playingIdx >= 0) setPlayIcon(playingIdx, false);
      playingIdx = -1;
      try {
        audio.pause();
      } catch (e) {}
    }

    async function togglePreview(idx) {
      const t = currentTracks[idx];
      if (!t) return;
      if (touring) pauseTour();

      if (playingIdx === idx && !audio.paused) {
        stopPreview();
        return;
      }
      stopPreview();

      let url = t.previewUrl;
      if (!url) {
        setPlayIcon(idx, true);
        try {
          const r = await fetch(`/api/preview?id=${encodeURIComponent(t.id)}&country=${currentCountryCode}`);
          if (r.ok) url = (await r.json()).previewUrl;
        } catch (e) {}
        if (!url) {
          setPlayIcon(idx, false);
          showToast('この曲は試聴音源がありません');
          return;
        }
        t.previewUrl = url;
      }

      audio.src = url;
      playingIdx = idx;
      setPlayIcon(idx, true);
      audio.play().catch(() => {
        stopPreview();
        showToast('再生できませんでした');
      });
    }

    audio.addEventListener('ended', () => stopPreview());

    const listEl = document.getElementById('song-list-container');
    const onListClick = (e) => {
      const btn = e.target.closest('[data-action="play"]');
      if (btn) togglePreview(Number(btn.dataset.idx));
      const retry = e.target.closest('[data-action="retry"]');
      if (retry && lastRequest) fetchChart(...lastRequest);
    };
    listEl?.addEventListener('click', onListClick);

    // ---------- シェア ----------
    async function shareTopSong() {
      const t = currentTracks[0];
      const country = COUNTRIES[currentCountryCode];
      if (!t || !country) return;
      const text = `今、${country.name}でヘビロテされているのはこの曲！\n${country.flag}「${t.title}」${t.artist}\n\n#GlobeTrack #KsVOX\n`;

      if (navigator.share) {
        try {
          await navigator.share({ title: 'GlobeTrack', text, url: APP_URL });
        } catch (e) {}
        return;
      }
      try {
        await navigator.clipboard.writeText(`${text}${APP_URL}`);
        showToast('シェア用の文章をコピーしました');
      } catch (e) {
        showToast('シェアできませんでした');
      }
    }
    const shareBtn = document.getElementById('share-btn');
    shareBtn?.addEventListener('click', shareTopSong);

    // ---------- 音楽で世界一周 ----------
    let touring = false;
    let tourPaused = false;
    let tourIdx = 0;
    let tourToken = 0;
    let tourTimer = null;
    const tourAudio = new Audio();
    tourAudio.preload = 'auto';

    // スマホで「ボタンを押した後に音を出す」許可を得るための、ごく短い無音データ
    const SILENT_WAV = (() => {
      const n = 400;
      const buf = new ArrayBuffer(44 + n * 2);
      const v = new DataView(buf);
      const w = (o, str) => [...str].forEach((ch, i) => v.setUint8(o + i, ch.charCodeAt(0)));
      w(0, 'RIFF'); v.setUint32(4, 36 + n * 2, true); w(8, 'WAVE'); w(12, 'fmt ');
      v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
      v.setUint32(24, 8000, true); v.setUint32(28, 16000, true); v.setUint16(32, 2, true); v.setUint16(34, 16, true);
      w(36, 'data'); v.setUint32(40, n * 2, true);
      let bin = '';
      new Uint8Array(buf).forEach((b) => (bin += String.fromCharCode(b)));
      return 'data:audio/wav;base64,' + btoa(bin);
    })();

    const $ = (id) => document.getElementById(id);

    function setTourButton() {
      const main = $('tour-btn-main');
      const sub = $('tour-btn-sub');
      const btn = $('tour-btn');
      if (!main || !sub || !btn) return;
      if (touring) {
        main.textContent = '✕ 世界一周を終了';
        sub.style.display = 'none';
        btn.style.background = 'rgba(39,39,42,0.95)';
        btn.style.color = '#fff';
      } else {
        main.textContent = '🌐 音楽で世界一周';
        sub.style.display = '';
        btn.style.background = '#1DB954';
        btn.style.color = '#000';
      }
    }

    function setPauseLabel() {
      const label = $('tour-pause-label');
      const icon = $('tour-pause-icon');
      if (label) label.textContent = tourPaused ? '再開' : '停止';
      if (icon) icon.className = tourPaused ? 'fa-solid fa-play' : 'fa-solid fa-pause';
    }

    function setTourStatus(text) {
      const el = $('tour-status');
      if (el) el.textContent = text;
    }

    function openTourConfirm() {
      const el = $('tour-confirm');
      if (el) el.style.display = 'flex';
    }
    function closeTourConfirm() {
      const el = $('tour-confirm');
      if (el) el.style.display = 'none';
    }

    function startTour() {
      closeTourConfirm();
      // ボタンを押したこの瞬間に音の再生許可を取っておく
      try {
        tourAudio.src = SILENT_WAV;
        tourAudio.play().catch(() => {});
      } catch (e) {}
      closeSheet();
      stopPreview();
      touring = true;
      setTourButton();
      const card = $('tour-card');
      if (card) card.style.display = 'block';
      tourGo(0);
    }

    function endTour() {
      touring = false;
      tourPaused = false;
      tourToken++;
      clearTimeout(tourTimer);
      try {
        tourAudio.pause();
      } catch (e) {}
      const card = $('tour-card');
      if (card) card.style.display = 'none';
      setTourButton();
      setPauseLabel();
      if (map) map.flyToBounds(DEFAULT_VIEW, { duration: 1.2, padding: [10, 10] });
    }

    function pauseTour() {
      if (!touring || tourPaused) return;
      tourPaused = true;
      clearTimeout(tourTimer);
      try {
        tourAudio.pause();
      } catch (e) {}
      setPauseLabel();
    }

    function resumeTour() {
      if (!touring) return;
      tourPaused = false;
      setPauseLabel();
      const hasSong = tourAudio.src && !tourAudio.src.startsWith('data:') && !tourAudio.ended;
      if (hasSong) {
        tourAudio.play().catch(() => {});
        const remain = ((tourAudio.duration || 30) - (tourAudio.currentTime || 0) + 3) * 1000;
        clearTimeout(tourTimer);
        tourTimer = setTimeout(() => tourGo(tourIdx + 1), Math.max(remain, 3000));
      } else {
        tourGo(tourIdx);
      }
    }

    async function tourGo(i) {
      const token = ++tourToken;
      clearTimeout(tourTimer);
      if (i >= TOUR_ORDER.length) {
        endTour();
        showToast('世界一周、おつかれさまでした！');
        return;
      }
      tourIdx = i;
      tourPaused = false;
      setPauseLabel();
      try {
        tourAudio.pause();
      } catch (e) {}

      const code = TOUR_ORDER[i];
      const c = COUNTRIES[code];
      const info = COUNTRY_INFO[code];

      // カードの固定情報を先に表示
      if ($('tour-flag')) $('tour-flag').textContent = c.flag;
      if ($('tour-name')) $('tour-name').textContent = c.name;
      if ($('tour-count')) $('tour-count').textContent = `${i + 1}/${TOUR_ORDER.length}`;
      const timeEl = $('tour-time');
      if (timeEl) {
        timeEl.dataset.tz = info.tz;
        timeEl.innerHTML = clockHtml(info.tz);
      }
      if ($('tour-hello')) $('tour-hello').textContent = `${info.hello}!`;
      if ($('tour-foods')) $('tour-foods').textContent = info.foods;
      if ($('tour-genre')) $('tour-genre').textContent = '集計中…';
      if ($('tour-title')) $('tour-title').textContent = '';
      if ($('tour-artist')) $('tour-artist').textContent = '';
      if ($('tour-img')) $('tour-img').removeAttribute('src');
      if ($('tour-progress')) $('tour-progress').style.width = '0%';
      setTourStatus('読み込み中…');

      if (map) map.flyTo(c.coords, TOUR_ZOOM[code] || 4, { duration: 1.6 });

      const tracks = await loadCountry(code);
      if (token !== tourToken || !touring) return;

      const { top } = genreSummary(tracks);
      if ($('tour-genre')) $('tour-genre').textContent = top.length ? top.map((g) => g.name).join('・') + ' が人気' : '';

      const t = tracks[0];
      if (!t) {
        setTourStatus('取得できませんでした');
        tourTimer = setTimeout(() => tourGo(i + 1), 4000);
        return;
      }
      if ($('tour-title')) $('tour-title').textContent = t.title;
      if ($('tour-artist')) $('tour-artist').textContent = t.artist;
      if ($('tour-img') && t.img) $('tour-img').src = t.img;

      let url = t.previewUrl;
      if (!url) {
        try {
          const r = await fetch(`/api/preview?id=${encodeURIComponent(t.id)}&country=${code}`);
          if (r.ok) url = (await r.json()).previewUrl;
        } catch (e) {}
        if (url) t.previewUrl = url;
      }
      if (token !== tourToken || !touring) return;

      if (!url) {
        setTourStatus('この曲は試聴音源がありません');
        tourTimer = setTimeout(() => tourGo(i + 1), 6000);
        return;
      }

      // 一時停止中に読み込みが終わった場合は、再開を待つ
      if (tourPaused) {
        tourAudio.src = url;
        setTourStatus('一時停止中');
        return;
      }

      setTourStatus('1位 再生中');
      tourAudio.src = url;
      tourAudio.play().catch(() => {
        tourPaused = true;
        setPauseLabel();
        setTourStatus('「再開」を押すと再生します');
      });
      // 万一「再生終了」の合図が来なくても先へ進む保険
      tourTimer = setTimeout(() => {
        if (token === tourToken && touring && !tourPaused) tourGo(i + 1);
      }, 35000);
    }

    tourAudio.addEventListener('ended', () => {
      if (touring && !tourPaused && !tourAudio.src.startsWith('data:')) tourGo(tourIdx + 1);
    });
    tourAudio.addEventListener('timeupdate', () => {
      const bar = $('tour-progress');
      if (bar && tourAudio.duration && !tourAudio.src.startsWith('data:')) {
        bar.style.width = `${Math.min(100, (tourAudio.currentTime / tourAudio.duration) * 100)}%`;
      }
    });

    const tourBtn = $('tour-btn');
    const onTourBtn = () => (touring ? endTour() : openTourConfirm());
    tourBtn?.addEventListener('click', onTourBtn);
    const tourGoBtn = $('tour-go');
    tourGoBtn?.addEventListener('click', startTour);
    const tourCancelBtn = $('tour-cancel');
    tourCancelBtn?.addEventListener('click', closeTourConfirm);
    const tourPauseBtn = $('tour-pause');
    const onTourPause = (e) => {
      e.stopPropagation();
      tourPaused ? resumeTour() : pauseTour();
    };
    tourPauseBtn?.addEventListener('click', onTourPause);
    const tourNextBtn = $('tour-next');
    const onTourNext = (e) => {
      e.stopPropagation();
      tourGo(tourIdx + 1);
    };
    tourNextBtn?.addEventListener('click', onTourNext);
    // カードをタップ → その国の詳しいプロフィールとランキングを開く(世界一周は一時停止)
    const tourCard = $('tour-card');
    const onTourCard = () => {
      if (!touring) return;
      pauseTour();
      fetchChart(TOUR_ORDER[tourIdx], 'now', '今聴かれている曲 Top 10', 10);
    };
    tourCard?.addEventListener('click', onTourCard);
    // 別のアプリに切り替えたら一時停止
    const onVisibility = () => {
      if (document.hidden) pauseTour();
    };
    document.addEventListener('visibilitychange', onVisibility);

    // ---------- 閉じる操作 ----------
    const closeBtn = document.getElementById('close-sheet-btn');
    const handleEl = document.getElementById('sheet-handle');
    closeBtn?.addEventListener('click', closeSheet);
    handleEl?.addEventListener('click', closeSheet);

    const onResize = () => {
      if (map) map.invalidateSize();
    };
    window.addEventListener('resize', onResize);

    // Leaflet(外部CDN)の読み込み完了を待ってから初期化
    function waitForLeafletThenInit() {
      let attempts = 0;
      const tryInit = () => {
        if (typeof window.L !== 'undefined') {
          initPlaylists();
          initMap();
          fetchMusicNews();
          return;
        }
        attempts++;
        if (attempts < 50) {
          setTimeout(tryInit, 100);
        } else {
          console.warn('Leafletの読み込みに失敗しました');
          initPlaylists();
          fetchMusicNews();
        }
      };
      tryInit();
    }

    if (document.readyState === 'complete') {
      waitForLeafletThenInit();
    } else {
      window.addEventListener('load', waitForLeafletThenInit, { once: true });
    }

    return () => {
      window.removeEventListener('resize', onResize);
      clearInterval(playlistTimer);
      closeBtn?.removeEventListener('click', closeSheet);
      handleEl?.removeEventListener('click', closeSheet);
      shareBtn?.removeEventListener('click', shareTopSong);
      listEl?.removeEventListener('click', onListClick);
      stopPreview();
      clearInterval(clockTimer);
      tourBtn?.removeEventListener('click', onTourBtn);
      tourGoBtn?.removeEventListener('click', startTour);
      tourCancelBtn?.removeEventListener('click', closeTourConfirm);
      tourPauseBtn?.removeEventListener('click', onTourPause);
      tourNextBtn?.removeEventListener('click', onTourNext);
      tourCard?.removeEventListener('click', onTourCard);
      document.removeEventListener('visibilitychange', onVisibility);
      touring = false;
      tourToken++;
      clearTimeout(tourTimer);
      try {
        tourAudio.pause();
      } catch (e) {}
      if (map) {
        map.remove();
        map = null;
      }
      delete window.fetchChart;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Head>
        <title>GlobeTrack - 世界で&ldquo;今&rdquo;聴かれてる曲は？</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
        <meta name="description" content="世界各国で今いちばん聴かれている曲がひと目でわかる。提供：ボーカル道場K's VOX" />
      </Head>

      <div className="flex flex-col h-full w-full max-w-md mx-auto relative bg-spotify-black border-x border-zinc-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <header
          className="pt-3 px-4 pb-2 z-20 flex items-center space-x-2.5 shrink-0 border-b border-zinc-800/60"
          style={{ backgroundColor: '#252832' }}
        >
          <div className="flex flex-col space-y-0.5 min-w-0 w-full">
            <div className="flex items-center space-x-1.5 text-spotify-green">
              <i className="fa-solid fa-globe text-xs"></i>
              <span className="text-[11px] font-bold tracking-wider uppercase">WORLD MUSIC CHART</span>
            </div>
            <div className="flex items-center space-x-2 min-w-0">
              <img src="/logo.png" alt="GlobeTrack Logo" className="w-8 h-8 object-contain flex-shrink-0" />
              <h1 className="text-xl font-extrabold tracking-tight text-white leading-tight shrink-0">GlobeTrack</h1>
              <span className="shrink-0 px-1.5 py-0.5 rounded-md border border-spotify-green/60 bg-spotify-green/15 text-spotify-green text-[9px] font-extrabold tracking-wide leading-none">
                Ver2.0
              </span>
              <p className="text-xs text-zinc-400 font-medium truncate min-w-0">世界で&ldquo;今&rdquo;聴かれている曲は？</p>
            </div>
          </div>
        </header>

        {/* 国別ランキング20 */}
        <div className="px-2.5 py-2 z-20 flex items-center space-x-2 overflow-x-auto shrink-0 bg-black/80 border-b border-zinc-800">
          <button
            type="button"
            onClick={() => window.fetchChart && window.fetchChart('US', 'top20', '国別ランキング 20', 20)}
            className="flex-1 min-w-[100px] px-2 py-1.5 rounded-xl bg-zinc-900 border border-amber-500/50 text-xs font-bold hover:border-amber-400 active:scale-95 transition-all cursor-pointer"
          >
            🇺🇸 米 国別ランキング 20
          </button>
          <button
            type="button"
            onClick={() => window.fetchChart && window.fetchChart('GB', 'top20', '国別ランキング 20', 20)}
            className="flex-1 min-w-[100px] px-2 py-1.5 rounded-xl bg-zinc-900 border border-blue-500/50 text-xs font-bold hover:border-blue-400 active:scale-95 transition-all cursor-pointer"
          >
            🇬🇧 英 国別ランキング 20
          </button>
          <button
            type="button"
            onClick={() => window.fetchChart && window.fetchChart('JP', 'top20', '国別ランキング 20', 20)}
            className="flex-1 min-w-[100px] px-2 py-1.5 rounded-xl bg-zinc-900 border border-red-500/50 text-xs font-bold hover:border-red-400 active:scale-95 transition-all cursor-pointer"
          >
            🇯🇵 日 国別ランキング 20
          </button>
        </div>

        {/* ニュースティッカー */}
        <div className="z-20 bg-zinc-950/90 border-b border-zinc-800/80 py-1.5 px-3 overflow-hidden flex items-center shrink-0">
          <div className="flex items-center space-x-1 bg-spotify-green/20 text-spotify-green px-1.5 py-0.5 rounded text-[10px] font-bold uppercase mr-2 shrink-0">
            <i className="fa-solid fa-bolt text-[9px]"></i>
            <span>NEWS</span>
          </div>
          <div className="overflow-hidden whitespace-nowrap flex-1 text-xs text-zinc-300">
            <span id="news-ticker-text" className="animate-marquee inline-block">
              <span>🎵 ニュース取得中... &nbsp;&nbsp;&nbsp;&nbsp;</span>
            </span>
          </div>
        </div>

        {/* 地図エリア */}
        <div id="map-wrapper">
          <div id="map"></div>
          {/* 集計中の進み具合 */}
          <div
            id="load-progress"
            className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center space-x-2 px-3 py-1.5 rounded-full bg-zinc-900/90 border border-spotify-green/60 shadow-lg backdrop-blur-md text-[11px] font-bold text-white whitespace-nowrap pointer-events-none"
            style={{ zIndex: 700, transition: 'opacity 0.5s ease' }}
          >
            <span className="w-3 h-3 border-2 border-spotify-green border-t-transparent rounded-full animate-spin"></span>
            <span>🌍</span>
            <span id="load-progress-label">世界11カ国のランキングを集計中…</span>
            <span id="load-progress-num" className="text-spotify-green">
              0/11
            </span>
          </div>

          {/* 音楽で世界一周ボタン(押す前=出発/押した後=終了) */}
          <button
            id="tour-btn"
            type="button"
            className="absolute top-2 right-2 flex flex-col items-center px-3 py-1.5 rounded-2xl shadow-lg active:scale-95 transition-transform cursor-pointer"
            style={{ zIndex: 750, background: '#1DB954', color: '#000' }}
          >
            <span id="tour-btn-main" className="text-xs font-extrabold leading-tight">
              🌐 音楽で世界一周
            </span>
            <span id="tour-btn-sub" className="text-[9px] font-bold leading-tight opacity-80">
              🔊 各国の1位が30秒ずつ流れます
            </span>
          </button>

          {/* 世界一周中のカード */}
          <div
            id="tour-card"
            className="absolute left-2 right-2 bottom-2 rounded-2xl border border-spotify-green p-3 shadow-2xl cursor-pointer"
            style={{ zIndex: 750, display: 'none', background: 'rgba(18,18,20,0.96)' }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 min-w-0">
                <span id="tour-flag" className="text-lg leading-none"></span>
                <span id="tour-name" className="text-sm font-extrabold text-white"></span>
                <span id="tour-time" className="gt-localtime text-xs font-bold text-white ml-1"></span>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <span id="tour-hello" className="text-sm font-extrabold" style={{ color: '#F5B8D5' }}></span>
                <span id="tour-count" className="text-[10px] text-zinc-400"></span>
              </div>
            </div>
            <div className="mt-1 text-[11px] text-zinc-400 truncate">
              🍽 <span id="tour-foods"></span>
            </div>
            <div className="text-[11px] text-zinc-400 truncate">
              🎵 <span id="tour-genre"></span>
            </div>
            <div className="mt-2 flex items-center space-x-2.5">
              <img id="tour-img" alt="" className="w-11 h-11 rounded-lg object-cover bg-zinc-800 shrink-0" />
              <div className="min-w-0 flex-1">
                <div id="tour-status" className="text-[10px] font-bold text-spotify-green"></div>
                <div id="tour-title" className="text-xs font-bold text-white truncate"></div>
                <div id="tour-artist" className="text-[11px] text-zinc-400 truncate"></div>
              </div>
            </div>
            <div className="h-1 bg-zinc-800 rounded-full my-2 overflow-hidden">
              <div id="tour-progress" className="h-full bg-spotify-green rounded-full" style={{ width: '0%', transition: 'width 0.25s linear' }}></div>
            </div>
            <div className="flex space-x-2">
              <button
                id="tour-pause"
                type="button"
                className="flex-1 py-1.5 rounded-xl bg-zinc-800 text-zinc-200 text-[11px] font-bold active:scale-95 transition-transform"
              >
                <i id="tour-pause-icon" className="fa-solid fa-pause"></i> <span id="tour-pause-label">停止</span>
              </button>
              <button
                id="tour-next"
                type="button"
                className="flex-1 py-1.5 rounded-xl bg-spotify-green text-black text-[11px] font-bold active:scale-95 transition-transform"
              >
                <i className="fa-solid fa-forward-step"></i> 次の国へ
              </button>
            </div>
            <div className="mt-1.5 text-center text-[9px] text-zinc-500">カードをタップすると、この国のプロフィールとランキングが開きます</div>
          </div>
        </div>

        {/* K's VOX Spotify プレイリスト枠 */}
        <div className="z-20 bg-zinc-950 p-2 border-t border-zinc-900 shrink-0">
          <div className="flex items-center space-x-1.5 mb-1.5 text-xs font-bold text-spotify-green">
            <i className="fa-brands fa-spotify"></i>
            <a
              href="https://open.spotify.com/user/u8wz5jev5l2tvtn04mbgfzis2?si=xC9xT5zUQtywdw8gqmTcRQ&utm_source=copy-link"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:underline flex items-center space-x-1"
            >
              <span>K&apos;s VOX Spotify プレイリスト</span>
              <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
            </a>
          </div>
          <div id="playlist-container" className="flex overflow-x-auto space-x-2 snap-x snap-mandatory playlist-scroll pb-1"></div>
        </div>

        {/* K's VOX RECORD Showcase バナー */}
        <div className="z-20 bg-zinc-950 px-2 pb-2 pt-1 shrink-0">
          <div className="flex items-center space-x-1.5 mb-1.5 text-xs font-bold" style={{ color: '#F5B8D5' }}>
            <i className="fa-solid fa-record-vinyl"></i>
            <a href={SHOWCASE_URL} target="_blank" rel="noopener noreferrer" className="hover:underline flex items-center space-x-1">
              <span>K&apos;s VOX RECORD オリジナル英語曲</span>
              <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
            </a>
          </div>
          <a href={SHOWCASE_URL} target="_blank" rel="noopener noreferrer" className="block active:scale-[0.98] transition-transform">
            <img
              src="/showcase-banner.png"
              alt="K's VOX RECORD Showcase"
              className="w-full rounded-xl block"
              style={{ aspectRatio: '1200 / 252' }}
            />
          </a>
        </div>

        {/* クレジット */}
        <footer className="z-20 bg-black/90 py-2 px-3 text-center border-t border-zinc-900 text-[11px] text-zinc-400 shrink-0">
          提供：
          <a
            href="https://www.ksvox.net"
            target="_blank"
            rel="noopener noreferrer"
            className="text-spotify-green hover:underline font-bold"
          >
            ボーカル道場K&apos;s VOX <i className="fa-solid fa-arrow-up-right-from-square text-[9px]"></i>
          </a>
        </footer>

        {/* ランキング ボトムシート */}
        <div
          id="ranking-sheet"
          className="bottom-sheet closed fixed inset-x-0 bottom-0 h-[78%] max-w-md mx-auto bg-zinc-950/95 border-t border-zinc-800 rounded-t-3xl shadow-2xl flex flex-col backdrop-blur-2xl"
        >
          <div id="sheet-handle" className="w-full py-3 flex justify-center items-center cursor-pointer">
            <div className="w-12 h-1.5 rounded-full bg-zinc-700"></div>
          </div>
          <div className="px-5 pb-2.5 border-b border-zinc-800 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0">
                <span id="sheet-flag" className="text-2xl">
                  🇺🇸
                </span>
                <h2 id="sheet-title" className="text-base font-bold text-white truncate">
                  今聴かれている曲 Top 10
                </h2>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button
                  id="share-btn"
                  type="button"
                  aria-label="1位の曲をシェア"
                  className="h-8 px-2.5 rounded-full bg-spotify-green/20 text-spotify-green hover:bg-spotify-green hover:text-black flex items-center space-x-1 text-[11px] font-bold transition-colors active:scale-95 cursor-pointer"
                >
                  <i className="fa-solid fa-share-nodes"></i>
                  <span>1位をシェア</span>
                </button>
                <button
                  id="close-sheet-btn"
                  type="button"
                  aria-label="閉じる"
                  className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
                >
                  <i className="fa-solid fa-xmark text-base"></i>
                </button>
              </div>
            </div>
            {/* ボタンの意味(凡例) */}
            <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-zinc-400">
              <span className="flex items-center space-x-1">
                <i className="fa-solid fa-play" style={{ color: '#FA2D48' }}></i>
                <span>Apple Musicで試聴</span>
              </span>
              <span className="flex items-center space-x-1">
                <i className="fa-brands fa-spotify" style={{ color: '#1DB954' }}></i>
                <span>Spotifyで再生</span>
              </span>
              <span id="legend-youtube" className="flex items-center space-x-1" style={{ display: 'none' }}>
                <i className="fa-brands fa-youtube" style={{ color: '#FF0033' }}></i>
                <span>YouTube動画</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>🌍</span>
                <span>3カ国以上でランクイン</span>
              </span>
            </div>
            <p className="mt-1 text-[9px] text-zinc-500">出典：Apple Music 再生回数ランキング</p>
          </div>
          <div id="song-list-container" className="flex-1 overflow-y-auto px-4 py-3 space-y-2"></div>
        </div>

        {/* 世界一周の確認カード */}
        <div
          id="tour-confirm"
          className="fixed inset-0 max-w-md mx-auto items-center justify-center px-6"
          style={{ zIndex: 1800, display: 'none', background: 'rgba(0,0,0,0.65)' }}
        >
          <div className="w-full rounded-2xl bg-zinc-900 border border-spotify-green/60 p-5 text-center shadow-2xl">
            <div className="text-lg font-extrabold text-white mb-2">🌐 音楽で世界一周</div>
            <p className="text-xs text-zinc-300 leading-relaxed mb-2">
              これから11カ国を巡り、各国で今1位の曲を
              <br />
              30秒ずつ再生します(約5分半)。
            </p>
            <p className="text-[11px] font-bold leading-relaxed mb-4" style={{ color: '#F5B8D5' }}>
              🔊 音が出ます。周りの環境と音量にご注意ください。
            </p>
            <div className="flex space-x-2">
              <button
                id="tour-cancel"
                type="button"
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-200 text-xs font-bold active:scale-95 transition-transform"
              >
                やめる
              </button>
              <button
                id="tour-go"
                type="button"
                className="flex-1 py-2.5 rounded-xl bg-spotify-green text-black text-xs font-extrabold active:scale-95 transition-transform"
              >
                出発する
              </button>
            </div>
          </div>
        </div>

        {/* お知らせ表示 */}
        <div
          id="gt-toast"
          className="opacity-0 pointer-events-none transition-opacity duration-300 fixed left-1/2 -translate-x-1/2 bottom-8 z-[2000] px-4 py-2 rounded-full bg-zinc-800 text-white text-xs font-bold shadow-xl"
        ></div>
      </div>
    </>
  );
}
