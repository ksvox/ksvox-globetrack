import { useEffect } from 'react';
import Head from 'next/head';

export default function Home() {
  useEffect(() => {
    const COUNTRIES = {
      US: { name: 'アメリカ', flag: '🇺🇸', coords: [38.0, -97.0], topSong: '読み込み中...', offsetX: 0, offsetY: -35 },
      GB: { name: 'イギリス', flag: '🇬🇧', coords: [55.0, -3.5], topSong: '読み込み中...', offsetX: -30, offsetY: -45 },
      FR: { name: 'フランス', flag: '🇫🇷', coords: [46.2, 2.2], topSong: '読み込み中...', offsetX: -45, offsetY: 15 },
      DE: { name: 'ドイツ', flag: '🇩🇪', coords: [51.1, 10.4], topSong: '読み込み中...', offsetX: 40, offsetY: -35 },
      JP: { name: '日本', flag: '🇯🇵', coords: [36.2, 138.2], topSong: '読み込み中...', offsetX: 40, offsetY: -25 },
      KR: { name: '韓国', flag: '🇰🇷', coords: [35.9, 127.7], topSong: '読み込み中...', offsetX: -45, offsetY: 20 },
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

    let map = null;
    let currentPlaylistIdx = 0;
    let playlistTimer = null;

    const openSheet = () => document.getElementById('ranking-sheet')?.classList.replace('closed', 'open');
    const closeSheet = () => document.getElementById('ranking-sheet')?.classList.replace('open', 'closed');
    const escapeHtml = (str) =>
      String(str || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');

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

    async function fetchMusicNews() {
      const feeds = [
        { name: 'NME', url: 'https://nme-jp.com/feed/' },
        { name: 'BARKS', url: 'https://www.barks.jp/news/rss/rss.xml' },
        { name: 'MusicLife', url: 'https://www.musiclifeclub.com/rss.xml' },
      ];
      const tickerEl = document.getElementById('news-ticker-text');
      const items = [];

      await Promise.allSettled(
        feeds.map(async (f) => {
          try {
            const res = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(f.url)}`);
            if (res.ok) {
              const data = await res.json();
              if (data.status === 'ok' && data.items) {
                data.items
                  .slice(0, 3)
                  .forEach((i) =>
                    items.push(
                      `📰 [${f.name}] <a href="${i.link}" target="_blank" rel="noopener noreferrer">${escapeHtml(
                        i.title
                      )}</a>`
                    )
                  );
              }
            }
          } catch (e) {}
        })
      );

      if (!tickerEl) return;

      if (items.length) {
        items.sort(() => Math.random() - 0.5);
        const headlines = items.join(' &nbsp;&nbsp;&nbsp;&nbsp; ');
        tickerEl.innerHTML = `<span>${headlines} &nbsp;&nbsp;&nbsp;&nbsp;</span><span>${headlines} &nbsp;&nbsp;&nbsp;&nbsp;</span>`;
      } else {
        tickerEl.innerHTML = `<span>🎵 洋楽・来日公演・新作情報を更新中！ &nbsp;&nbsp;&nbsp;&nbsp;</span>`;
      }
    }

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

    async function preloadTopSongs() {
      Object.keys(COUNTRIES).forEach(async (code) => {
        try {
          const res = await fetch(`/api/chart?country=${code}&chartType=now&limit=1`);
          if (res.ok) {
            const data = await res.json();
            if (data.tracks?.[0]) updateBubbleSong(code, data.tracks[0].title);
          }
        } catch (e) {}
      });
    }

    function updateBubbleSong(code, title) {
      if (COUNTRIES[code]) COUNTRIES[code].topSong = title;
      const el = document.getElementById(`bubble-song-${code}`);
      if (el) el.textContent = title;
    }

    async function fetchChart(code, chartType = 'now', displayTitle = '', limit = 10) {
      const country = COUNTRIES[code] || COUNTRIES['US'];
      const flagEl = document.getElementById('sheet-flag');
      const titleEl = document.getElementById('sheet-title');
      if (flagEl) flagEl.textContent = country.flag;
      if (titleEl) titleEl.textContent = `${country.name} ${displayTitle}`;
      openSheet();

      const container = document.getElementById('song-list-container');
      if (container) {
        container.innerHTML = `<div class="flex items-center justify-center py-12 space-x-2"><div class="w-6 h-6 border-2 border-spotify-green border-t-transparent rounded-full animate-spin"></div><span class="text-xs text-zinc-400">取得中...</span></div>`;
      }

      try {
        const res = await fetch(`/api/chart?country=${code}&chartType=${chartType}&limit=${limit}`);
        if (res.ok) {
          const data = await res.json();
          if (data.tracks?.length) {
            if (chartType === 'now') updateBubbleSong(code, data.tracks[0].title);
            renderTracks(data.tracks);
            return;
          }
        }
      } catch (e) {}
    }
    window.fetchChart = fetchChart;

    function renderTracks(tracks) {
      const container = document.getElementById('song-list-container');
      if (!container) return;
      container.innerHTML = tracks
        .map((t, idx) => {
          const rank = t.rank || idx + 1;
          const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="300" height="300" fill="#181818"/><circle cx="150" cy="150" r="100" fill="#1DB954"/><text x="150" y="165" font-size="48" fill="#fff" text-anchor="middle">No.${rank}</text></svg>`;
          const fallbackImg = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);

          return `
                <div class="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800/80">
                    <div class="flex items-center space-x-3 min-w-0 flex-1">
                        <span class="w-6 h-6 rounded flex items-center justify-center text-xs font-extrabold shrink-0 ${
                          rank <= 3 ? 'rank-' + rank : 'rank-other'
                        }">${rank}</span>
                        <img src="${t.img || fallbackImg}" onerror="this.src='${fallbackImg}';" class="w-10 h-10 rounded-lg object-cover bg-zinc-800 shrink-0" />
                        <div class="min-w-0 flex-1">
                            <h4 class="text-xs font-bold text-white truncate">${escapeHtml(t.title)}</h4>
                            <p class="text-[11px] text-zinc-400 truncate">${escapeHtml(t.artist)}</p>
                        </div>
                    </div>
                    <a href="${t.url}" target="_blank" rel="noopener noreferrer" class="w-8 h-8 rounded-full bg-spotify-green/20 text-spotify-green hover:bg-spotify-green hover:text-black transition-colors flex items-center justify-center text-xs ml-2 shrink-0">
                        <i class="fa-solid fa-play"></i>
                    </a>
                </div>`;
        })
        .join('');
    }

    const closeBtn = document.getElementById('close-sheet-btn');
    const handleEl = document.getElementById('sheet-handle');
    closeBtn?.addEventListener('click', closeSheet);
    handleEl?.addEventListener('click', closeSheet);

    const onResize = () => {
      if (map) map.invalidateSize();
    };
    window.addEventListener('resize', onResize);

    // Leaflet(外部CDNスクリプト)の読み込みが完全に終わるまで待ってから初期化する。
    // 既にページ読み込みが完了している場合は即座に、まだの場合はloadイベントを待つ。
    // 念のため、window.Lがまだ無い場合は少し待って再試行する保険もかけておく。
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
      </Head>

      <div className="flex flex-col h-full w-full max-w-md mx-auto relative bg-spotify-black border-x border-zinc-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <header className="pt-3 px-4 pb-2 bg-black/90 z-20 flex flex-col space-y-0.5 shrink-0 border-b border-zinc-800/60">
          <div className="flex items-center space-x-1.5 text-spotify-green">
            <i className="fa-solid fa-globe text-xs"></i>
            <span className="text-[11px] font-bold tracking-wider uppercase">WORLD MUSIC CHART</span>
          </div>
          <h1 className="text-xl font-extrabold tracking-tight text-white leading-tight">GlobeTrack</h1>
          <p className="text-xs text-zinc-400 font-medium">世界で&ldquo;今&rdquo;聴かれている曲は？</p>
        </header>

        {/* 国別ランキング20 */}
        <div className="px-2.5 py-2 z-20 flex items-center space-x-2 overflow-x-auto shrink-0 bg-black/80 border-b border-zinc-800">
          <button
            type="button"
            onClick={() => window.fetchChart && window.fetchChart('US', 'billboard', '国別ランキング 20', 20)}
            className="flex-1 min-w-[100px] px-2 py-1.5 rounded-xl bg-zinc-900 border border-amber-500/50 text-xs font-bold hover:border-amber-400 active:scale-95 transition-all cursor-pointer"
          >
            🇺🇸 米 国別ランキング 20
          </button>
          <button
            type="button"
            onClick={() => window.fetchChart && window.fetchChart('GB', 'billboard', '国別ランキング 20', 20)}
            className="flex-1 min-w-[100px] px-2 py-1.5 rounded-xl bg-zinc-900 border border-blue-500/50 text-xs font-bold hover:border-blue-400 active:scale-95 transition-all cursor-pointer"
          >
            🇬🇧 英 国別ランキング 20
          </button>
          <button
            type="button"
            onClick={() => window.fetchChart && window.fetchChart('JP', 'billboard', '国別ランキング 20', 20)}
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
          <div className="px-5 pb-3 flex items-center justify-between border-b border-zinc-800 shrink-0">
            <div className="flex items-center space-x-2">
              <span id="sheet-flag" className="text-2xl">
                🇺🇸
              </span>
              <h2 id="sheet-title" className="text-base font-bold text-white">
                今聴かれている曲 Top 10
              </h2>
            </div>
            <button
              id="close-sheet-btn"
              type="button"
              aria-label="閉じる"
              className="w-8 h-8 rounded-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white flex items-center justify-center transition-colors active:scale-95 cursor-pointer"
            >
              <i className="fa-solid fa-xmark text-base"></i>
            </button>
          </div>
          <div id="song-list-container" className="flex-1 overflow-y-auto px-4 py-3 space-y-2"></div>
        </div>
      </div>
    </>
  );
}
