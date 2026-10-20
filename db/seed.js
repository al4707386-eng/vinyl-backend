const db = require('./init');

const initial = [
  {
    id: 'the-cure-disintegration',
    title: 'Disintegration', artist: 'The Cure', year: 1989, genre: 'Post-Punk',
    label: 'Fiction', country: 'Великобритания', price: 4700, color: '#2b3245',
    cover: '/uploads/covers/the-cure-disintegration.jpg',
    images: ['/uploads/covers/the-cure-disintegration-1.jpg'],
    description: 'Восьмой студийный альбом Роберта Смита — меланхоличный шедевр.',
    tracks: ['Plainsong', 'Pictures of You', 'Lovesong', 'Fascination Street'],
  },
  {
    id: 'depeche-mode-violator',
    title: 'Violator', artist: 'Depeche Mode', year: 1990, genre: 'Synth-Pop',
    label: 'Mute', country: 'Великобритания', price: 4900, color: '#4a2a2a',
    cover: '/uploads/covers/depeche-mode-violator.jpg',
    images: ['/uploads/covers/depeche-mode-violator-1.jpg'],
    description: 'Самый успешный альбом Depeche Mode.',
    tracks: ['Personal Jesus', 'Enjoy the Silence', 'Policy of Truth', 'World in My Eyes'],
  },
  {
    id: 'queen-night-at-the-opera',
    title: 'A Night at the Opera', artist: 'Queen', year: 1975, genre: 'Rock',
    label: 'EMI', country: 'Великобритания', price: 4400, color: '#4a3a6b',
    cover: '/uploads/covers/queen-night-at-the-opera.jpg',
    images: ['/uploads/covers/queen-night-at-the-opera-1.jpg'],
    description: 'Самый дорогой альбом своего времени.',
    tracks: ['Bohemian Rhapsody', 'Love of My Life', 'You’re My Best Friend'],
  },
  {
    id: 'david-bowie-ziggy',
    title: 'The Rise and Fall of Ziggy Stardust', artist: 'David Bowie', year: 1972, genre: 'Glam Rock',
    label: 'RCA', country: 'Великобритания', price: 4800, color: '#8a3a2a',
    cover: '/uploads/covers/david-bowie-ziggy.jpg',
    images: ['/uploads/covers/david-bowie-ziggy-1.jpg'],
    description: 'Концептуальный альбом о вымышленной рок-звезде.',
    tracks: ['Starman', 'Ziggy Stardust', 'Suffragette City'],
  },
  {
    id: 'nirvana-nevermind',
    title: 'Nevermind', artist: 'Nirvana', year: 1991, genre: 'Grunge',
    label: 'DGC', country: 'США', price: 3900, color: '#2b4a7a',
    cover: '/uploads/covers/nirvana-nevermind.jpg',
    images: ['/uploads/covers/nirvana-nevermind-1.jpg'],
    description: 'Альбом, который вынес гранж на первые строчки чартов.',
    tracks: ['Smells Like Teen Spirit', 'In Bloom', 'Come as You Are', 'Lithium'],
  },
  {
    id: 'the-smiths-queen-is-dead',
    title: 'The Queen Is Dead', artist: 'The Smiths', year: 1986, genre: 'Indie Rock',
    label: 'Rough Trade', country: 'Великобритания', price: 4500, color: '#3a3a3a',
    cover: '/uploads/covers/the-smiths-queen-is-dead.jpg',
    images: ['/uploads/covers/the-smiths-queen-is-dead-1.jpg'],
    description: 'Моррисси и Джонни Марр на пике формы.',
    tracks: ['The Queen Is Dead', 'There Is a Light That Never Goes Out', 'Bigmouth Strikes Again'],
  },
  {
    id: 'michael-jackson-thriller',
    title: 'Thriller', artist: 'Michael Jackson', year: 1982, genre: 'Pop',
    label: 'Epic', country: 'США', price: 4100, color: '#7a2f2f',
    cover: '/uploads/covers/michael-jackson-thriller.jpg',
    images: ['/uploads/covers/michael-jackson-thriller-1.jpg'],
    description: 'Самый продаваемый альбом в истории музыки.',
    tracks: ['Thriller', 'Beat It', 'Billie Jean'],
  },
  {
    id: 'the-beatles-abbey-road',
    title: 'Abbey Road', artist: 'The Beatles', year: 1969, genre: 'Rock',
    label: 'Apple', country: 'Великобритания', price: 4500, color: '#7a4a2b',
    cover: '/uploads/covers/the-beatles-abbey-road.jpg',
    images: ['/uploads/covers/the-beatles-abbey-road-1.jpg'],
    description: 'Последний записанный альбом группы.',
    tracks: ['Come Together', 'Something', 'Here Comes the Sun', 'Because'],
  },
  {
    id: 'radiohead-ok-computer',
    title: 'OK Computer', artist: 'Radiohead', year: 1997, genre: 'Alternative Rock',
    label: 'Parlophone', country: 'Великобритания', price: 4200, color: '#3f4a55',
    cover: '/uploads/covers/radiohead-ok-computer.jpg',
    images: ['/uploads/covers/radiohead-ok-computer-1.jpg'],
    description: 'Альбом об отчуждении в мире технологий.',
    tracks: ['Paranoid Android', 'Karma Police', 'No Surprises'],
  },
  {
    id: 'bon-jovi-slippery',
    title: 'Slippery When Wet', artist: 'Bon Jovi', year: 1986, genre: 'Hard Rock',
    label: 'Mercury', country: 'США', price: 4000, color: '#2f4a5d',
    cover: '/uploads/covers/bon-jovi-slippery.jpg',
    images: ['/uploads/covers/bon-jovi-slippery-1.jpg'],
    description: 'Самый продаваемый альбом Bon Jovi.',
    tracks: ['Livin’ on a Prayer', 'You Give Love a Bad Name', 'Wanted Dead or Alive'],
  },
  {
    id: 'acdc-back-in-black',
    title: 'Back in Black', artist: 'AC/DC', year: 1980, genre: 'Hard Rock',
    label: 'Atlantic', country: 'Австралия', price: 4300, color: '#1f1f1f',
    cover: '/uploads/covers/acdc-back-in-black.jpg',
    images: ['/uploads/covers/acdc-back-in-black-1.jpg'],
    description: 'Один из самых продаваемых альбомов в истории рока.',
    tracks: ['Hells Bells', 'Back in Black', 'You Shook Me All Night Long'],
  },
];

const insert = db.prepare(`
  INSERT OR REPLACE INTO records
    (id, title, artist, year, genre, label, country, price, color, cover, images, inStock, description, tracks)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?, ?)
`);

for (const r of initial) {
  insert.run(
    r.id, r.title, r.artist, r.year, r.genre, r.label, r.country,
    r.price, r.color, r.cover, JSON.stringify(r.images),
    r.description, JSON.stringify(r.tracks)
  );
}

console.log(`Добавлено пластинок с обложками: ${initial.length}`);