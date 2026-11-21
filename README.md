# 🔍 Cari Perbedaannya!

[![make.fun](https://make.fun/badge/best-spot-the-difference-game-20261121-0451.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)
[![rank](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Azet17/makefun-best-spot-the-difference-game-20261121-0451/rank.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)
[![reward](https://make.fun/badge/best-spot-the-difference-game-20261121-0451/Azet17/makefun-best-spot-the-difference-game-20261121-0451/reward.svg)](https://make.fun/c/best-spot-the-difference-game-20261121-0451)

Game **spot the difference** original: dua gambar nyaris identik berdampingan,
temukan **7 perbedaan** di setiap level. Tiga dunia yang digambar prosedural
oleh kode game ini sendiri — tanpa gambar, font, atau suara dari luar.

## Level

| Level | Suasana | Perbedaan yang disembunyikan |
|---|---|---|
| 1 — Taman Senja | Taman kota saat matahari terbenam | sinar matahari, burung, warna bunga, papan bangku, awan, ekor kucing, bebek kolam |
| 2 — Pasar Malam | Pasar malam yang ramai | warna lampion, bintang, tulisan papan, balon, bulan, roda gerobak, lampu gantung |
| 3 — Pantai Pagi | Pagi di pantai | warna payung, kepiting, warna layar, kerang, kelapa, warna ember, jejak kaki |

## Cara main

- **Klik** perbedaan di gambar kiri **atau** kanan — keduanya bisa.
- Perbedaan yang ketemu ditandai lingkaran hijau + centang di kedua panel.
- **Hint** (tombol atau `H`): menunjukkan satu perbedaan yang belum ketemu
  (3x per level, −50 poin).
- **Timer** 2:30 per level — sisa waktu jadi bonus skor saat level selesai.
- Klik yang salah −25 poin dan mereset combo; temuan beruntun menaikkan combo (+25 per tingkat).
- Keyboard: `←↑↓→` gerakkan bidikan, `Tab` ganti panel, `Enter`/`Spasi` klik,
  `H` hint, `M` suara, `R` ulangi level, `N` level berikutnya.
- Semua suara disintesis WebAudio di dalam game — tidak ada file audio eksternal.

## Menjalankan

```sh
node serve.ts        # lalu buka http://localhost:8080
```

Tidak ada build step: `game/` adalah file statis biasa.

## Mode demo (untuk screenshot)

Query `?shot=...` menampilkan satu frame permainan asli yang sudah berjalan:

- `?shot=cover` (atau `?shot=1`) — Level 1, 3 dari 7 perbedaan sudah ketemu
- `?shot=play` — Level 1, 1 perbedaan ketemu
- `?shot=level2` — Level 2, 2 perbedaan ketemu
- `?shot=level3` — Level 3, 4 perbedaan ketemu
- `?shot=end` — layar semua level selesai

## Struktur kode

```
game/
  index.html        layout + HUD + gaya
  src/
    main.js         state game, skor, timer, HUD, mode demo
    scenes.js       tiga pemandangan prosedural + 7 perbedaan per level
    differences.js  data perbedaan, hit-test, hint
    render.js       gambar panel, marker, partikel, bidikan
    input.js        mouse + keyboard
    audio.js        suara WebAudio (tanpa file eksternal)
main.ts             menyalin game/ + screenshots/ ke /output, menulis dossier.json
serve.ts            server statis lokal untuk tes
vendor/
  makefun-game.ts   library kit make.fun (tidak diubah)
```

## Lisensi

MIT — lihat `LICENSE`.
