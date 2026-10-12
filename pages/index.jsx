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
          .on('click', () => fetchChart(code, 'now', '今聴かれている曲 Top 10', 10));
      });

      setTimeout(() => {
        if (map) map.invalidateSize();
      }, 300);
      preloadTopSongs();
    }

    // 全カ国のTop10を1回でまとめて取得(サーバー側で30分保存されるので軽い)
    async function preloadTopSongs() {
      try {
        const res = await fetch('/api/chart?country=ALL&limit=10');
        if (res.ok) {
          const data = await res.json();
          Object.keys(data.charts || {}).forEach((code) => {
            const tracks = data.charts[code] || [];
            if (tracks.length) {
              nowChartCache[code] = tracks;
              updateBubbleSong(code, tracks[0].title);
            } else {
              updateBubbleSong(code, '—');
            }
          });
        }
      } catch (e) {}
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
      if (titleEl) titleEl.textContent = `${country.name} ${displayTitle}`;
      const ytLegend = document.getElementById('legend-youtube');
      if (ytLegend) ytLegend.style.display = mode === 'top20' ? '' : 'none';
      openSheet();

      const container = document.getElementById('song-list-container');
      if (container) {
        container.innerHTML = `<div class="flex items-center justify-center py-12 space-x-2"><div class="w-6 h-6 border-2 border-spotify-green border-t-transparent rounded-full animate-spin"></div><span class="text-xs text-zinc-400">取得中...</span></div>`;
      }

      if (mode === 'now' && nowChartCache[code]) {
        renderTracks(nowChartCache[code]);
        return;
      }

      try {
        const res = await fetch(`/api/chart?country=${code}&limit=${limit}`);
        if (res.ok) {
          const data = await res.json();
          if (data.tracks?.length) {
            if (mode === 'now') {
              nowChartCache[code] = data.tracks;
              updateBubbleSong(code, data.tracks[0].title);
            }
            // 取得中に別の国が開かれていたら表示しない
            if (currentCountryCode === code && currentMode === mode) renderTracks(data.tracks);
            return;
          }
        }
      } catch (e) {}

      if (container && currentCountryCode === code) {
        container.innerHTML = `<div class="text-center py-12 text-xs text-zinc-400">ランキングを取得できませんでした。<br>時間をおいて再度お試しください。</div>`;
      }
    }
    window.fetchChart = fetchChart;

    function renderTracks(tracks) {
      currentTracks = tracks;
      const container = document.getElementById('song-list-container');
      if (!container) return;

      container.innerHTML = tracks
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

        {/* お知らせ表示 */}
        <div
          id="gt-toast"
          className="opacity-0 pointer-events-none transition-opacity duration-300 fixed left-1/2 -translate-x-1/2 bottom-8 z-[2000] px-4 py-2 rounded-full bg-zinc-800 text-white text-xs font-bold shadow-xl"
        ></div>
      </div>
    </>
  );
}
