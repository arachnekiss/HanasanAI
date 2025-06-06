// Random Character and Background Selection System
export class RandomSelection {
  constructor() {
    this.characters = [
      '0613 inuinu1.003.vrm',
      '3821860369574327121.vrm',
      '6493143135142452442.vrm',
      '8329890252317737768.vrm',
      '8590256991748008892.vrm',
      'Alce Hikane (VRM 0.0).vrm',
      'Alce Hikane (VRM 1.0).vrm',
      'Alice Chan (Uniform ver) 1.0.2.vrm',
      'April.vrm',
      'BAMIKO_Ver1_0_3.vrm',
      'Calla_PC.vrm',
      'CamomeCamome.vrm',
      'Cintya escolar.vrm',
      'Fern VT model.vrm',
      'Godzilla-Chan_1.5.0.vrm',
      'Hoshino_Ai.vrm',
      'Iremia.vrm',
      'Kurone.vrm',
      'Kurone_all.vrm',
      'Kurone_jersey.vrm',
      'Kurone_parker.vrm',
      'Liqu.vrm',
      'MW Miku.vrm',
      'Micheline_1_1.vrm',
      'Nemu_V3.vrm',
      'PochibyKT_Pochi_VRM_1.0.0.vrm',
      'Sirius.vrm',
      'SpringSnow無料版.vrm',
      'annie.vrm',
      'carol-chan.vrm',
      'kousagiChiharu_Fairy_Doll.vrm',
      'lapan_cluster.vrm',
      'lapan_vrm0.vrm',
      'lulum_1.04.vrm',
      'アリシャーニャver0.2.1.vrm',
      'メモリアルフロウ_スイート_ロゼ_.vrm',
      '먪뫪깣묳뢠(뗢뵱)_ModelDRC_맕븵001.vrm'
    ];

    this.wallpapers = [
      '20250531_1428_Futuristic City Apartment_simple_compose_01jwjcxmz7ea6rk62bk5m6dnqx.png',
      '20250531_1428_Neon Cyberpunk Skyline_simple_compose_01jwjcxbxaetabnfyf650z5pqt.png',
      '20250531_1428_Neon Reflections in Rain_simple_compose_01jwjcxqh6fdyt5z3hcaz2q73s.png',
      '20250531_1428_Tokyo at Golden Hour_simple_compose_01jwjcxhrge9ta610gy839x7ct.png',
      '20250531_1449_Cyberpunk Tokyo Nightscape_simple_compose_01jwje41ybfyc82a55fnke3pqm.png',
      '20250531_1449_Nostalgic Classroom Sunset_simple_compose_01jwje44psfbq8wba10s65n0a3.png',
      '20250531_1449_Serene Sakura Avenue_simple_compose_01jwje3xjpeczrqfa3sdeze619.png',
      '20250531_1449_Snowy Shrine Night_simple_compose_01jwje47dpf6pt4hbcpgkphy9p.png',
      '20250531_1450_Seaside Anime Adventure_simple_compose_01jwje4bn0excv6mkwjt6z0fb0.png',
      '20250531_1452_Mystical Bamboo Forest_simple_compose_01jwje9w7ge8g93p2r5rmwfq09.png',
      '20250531_1452_Serene Tatami Room_simple_compose_01jwjea7jffwwryz2jg4v4z05k.png',
      '20250531_1453_Japanese Festival Night_simple_compose_01jwje9zcff95vghdjz69xzz9d.png',
      '20250531_1453_Steampunk Sky Journey_simple_compose_01jwjea1zvfj4rdypypsgr3pa4.png',
      '20250531_1454_Crimson Momiji Pathway_simple_compose_01jwjed1xze99r2g1qf0b5ebgz.png',
      '20250531_1454_Futuristic Esports Arena_simple_compose_01jwjeczbafnfrwhrn2mqtg44k.png',
      '20250531_1454_Magical Floating Library_simple_compose_01jwjede6qe44rdyy922hqk3dt.png',
      '20250531_1454_Melancholic Coastal Platform_simple_compose_01jwjed7y8e0ntd8jp0w37dztj.png',
      '20250531_1454_Twilight Rooftop Oasis_simple_compose_01jwjedbj0fn2sw1p2a1hx99ej.png',
      '20250531_1457_Enchanted Temple Ruins_simple_compose_01jwjejn0ye66vkrnr9rzc4gws.png',
      '20250531_1457_Manta Rays Glide_simple_compose_01jwjejjgkfh8r6xqthnnra75q.png',
      '20250531_1457_Neon Umbrellas Alley_simple_compose_01jwjejdgafgab9hx3yw3q0gjf.png',
      '20250531_1457_Rooftop BBQ Vibes_simple_compose_01jwjejqawekg8qf5jv6cs5w41.png',
      '20250531_1457_Sunflower Field Bliss_simple_compose_01jwjejg65fd1b70m3wkwhqeyv.png',
      '20250531_1500_Idyllic Rice Fields_simple_compose_01jwjeqss1ewsr6z5pdjbrvxv8.png',
      '20250531_1500_Lunar Base Earthrise_simple_compose_01jwjeqmmefa0afj5n85n4pr7d.png',
      '20250531_1500_Rainbow Over Coastal Cliff_simple_compose_01jwjeqv7efe48x5ax3v69fpj7.png',
      '20250531_1500_Victorian Tea Serenity_simple_compose_01jwjeqxmgfkkr6t0bpaq7kwk1.png',
      '20250531_1502_Shōwa-Era Summer Evening_simple_compose_01jwjevvfxf1a8d764gwvekd5t.png',
      '20250531_1502_Starry Lantern Festival_simple_compose_01jwjew87tepjatss35fn1mx46.png',
      '20250531_1502_Waterfall Rainbow Magic_simple_compose_01jwjew4wkec8tawkk6b7dcnec.png',
      '20250531_1504_Fantasy Castle Corridor_simple_compose_01jwjezc8vfx0svtmkt2kq4z9k.png',
      '20250531_1504_Mountaintop Shrine at Sunrise_simple_compose_01jwjezfn6fvwbkg10zjnhpg6d.png',
      '20250531_1507_Christmas Alpine Magic_simple_compose_01jwjf440qebaa53b1gn89da8e.png',
      '20250531_1507_Fireworks Over City Bay_simple_compose_01jwjf3yr5f82v6q9ve921n6nn.png',
      '20250531_1507_Futuristic Train Interior_simple_compose_01jwjf42d3fmwb3mt0a55m3rhf.png',
      '20250531_1507_Tropical Greenhouse Oasis_simple_compose_01jwjf4a7jfqttqjbbtvesnhry.png',
      '20250531_1507_Twilight Carousel_simple_compose_01jwjf4b1af5594yfjkefttr18.png',
      '20250531_1509_Dreamy Sakura Cascade_simple_compose_01jwjf8rxwepq9ssapavkw9r3x.png',
      '20250531_1510_Peaceful Bamboo Pathway_simple_compose_01jwjf91b1eaq8z62ve17b7dfr.png',
      '20250531_1510_Torii Sunrise Enchantment_simple_compose_01jwjf943neec8b11f8qhtxdy3.png',
      '20250531_1517_Floating Lantern Festival_simple_compose_01jwjfrrx8e5v8338e7a89n5e8.png',
      '20250531_1518_Cosmic Aurora Fantasy_simple_compose_01jwjfs1bgf119795qe1sseajc.png',
      '20250531_1518_Cozy Bookshelf Canyon_simple_compose_01jwjfrvsbet99e59xwwpde5ga.png',
      '20250531_1518_Rainbow Waterfall Vista_simple_compose_01jwjfryggf7gvy1ec1jtpz8ac.png',
      '20250531_1518_Rainy City Blur_simple_compose_01jwjfrmgsegzrc6yyrme2h6xr.png',
      '20250531_1519_Cyberpunk Neon Alley_simple_compose_01jwjfv60aeakvfm690h63rdxm.png'
    ];
  }

  getRandomCharacter() {
    const randomIndex = Math.floor(Math.random() * this.characters.length);
    return this.characters[randomIndex];
  }

  getRandomWallpaper() {
    const randomIndex = Math.floor(Math.random() * this.wallpapers.length);
    return this.wallpapers[randomIndex];
  }

  generateRandomSession() {
    return {
      vrm: this.getRandomCharacter(),
      wallpaper: this.getRandomWallpaper(),
      timestamp: Date.now()
    };
  }

  setRandomSession() {
    const randomSession = this.generateRandomSession();
    localStorage.setItem('currentSession', JSON.stringify(randomSession));
    console.log('Random session generated:', randomSession);
    return randomSession;
  }

  // Check if session should be randomized (new visit or forced refresh)
  shouldRandomize() {
    const currentSession = localStorage.getItem('currentSession');
    if (!currentSession) return true;
    
    const session = JSON.parse(currentSession);
    const now = Date.now();
    const sessionAge = now - (session.timestamp || 0);
    
    // Randomize if session is older than 30 minutes or no timestamp
    return sessionAge > 30 * 60 * 1000 || !session.timestamp;
  }

  initializeRandomSelection() {
    if (this.shouldRandomize()) {
      return this.setRandomSession();
    } else {
      const existing = JSON.parse(localStorage.getItem('currentSession'));
      
      // Check if the VRM model still exists in our available list
      if (existing.vrm && !this.characters.includes(existing.vrm)) {
        console.log('Session VRM no longer available, generating new session:', existing.vrm);
        return this.setRandomSession();
      }
      
      console.log('Using existing session:', existing);
      return existing;
    }
  }
}