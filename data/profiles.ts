export interface Profile {
  id: string;
  name: string;
  slug: string;
  age: number;
  location: string;
  city: string;
  tier: 'VIP' | 'VIP Spa' | 'Standard';
  isNew?: boolean;
  isVerified?: boolean;
  status: 'online' | 'recent';
  picsCount: number;
  vidsCount?: number;
  photoUrl: string;
  about: string;
  phone: string;
  whatsapp: string;
}

export const PROFILES: Profile[] = [
  // ── VIP BABES ──
  {
    id: '1',
    name: 'Amara',
    slug: 'amara',
    age: 23,
    location: 'Kololo, Kampala',
    city: 'Kampala',
    tier: 'VIP',
    isNew: true,
    isVerified: true,
    status: 'online',
    picsCount: 6,
    vidsCount: 3,
    photoUrl: 'https://spcdn.shortpixel.ai/spio/ret_img+q_cdnize+to_auto+s_webp:avif/ugandaescorts.net/wp-content/uploads/1790519050120/17905211817455-320x480.jpg',
    about: "I'm a fun, vibrant girl who loves meeting new people. Great company for dinners, events or a night in Kampala…",
    phone: '+256700000001',
    whatsapp: '256700000001'
  },
  {
    id: '2',
    name: 'Zara',
    slug: 'zara',
    age: 25,
    location: 'Nakasero, Kampala',
    city: 'Kampala',
    tier: 'VIP',
    isNew: false,
    isVerified: true,
    status: 'recent',
    picsCount: 9,
    photoUrl: 'https://spcdn.shortpixel.ai/spio/ret_img+q_cdnize+to_auto+s_webp:avif/ugandaescorts.net/wp-content/uploads/179063457886/17906345902390-320x480.jpg',
    about: 'Sophisticated, sensual and sweet. I love adventure and making unforgettable memories with special people…',
    phone: '+256700000002',
    whatsapp: '256700000002'
  },
  {
    id: '3',
    name: 'Bella',
    slug: 'bella',
    age: 24,
    location: 'Entebbe',
    city: 'Entebbe',
    tier: 'VIP Spa',
    isNew: false,
    isVerified: true,
    status: 'online',
    picsCount: 12,
    vidsCount: 2,
    photoUrl: 'https://spcdn.shortpixel.ai/spio/ret_img+q_cdnize+to_auto+s_webp:avif/ugandaescorts.net/wp-content/uploads/1779870585676/17798708195701-320x480.jpg',
    about: 'I offer full body massage, Swedish and body-to-body. Relax and unwind with me in Entebbe…',
    phone: '+256700000003',
    whatsapp: '256700000003'
  },
  {
    id: '4',
    name: 'Diana',
    slug: 'diana',
    age: 22,
    location: 'Jinja',
    city: 'Jinja',
    tier: 'VIP',
    isNew: true,
    isVerified: true,
    status: 'recent',
    picsCount: 5,
    photoUrl: 'https://spcdn.shortpixel.ai/spio/ret_img+q_cdnize+to_auto+s_webp:avif/ugandaescorts.net/wp-content/uploads/1789898771937/17898988146214-320x480.jpg',
    about: 'Charming, playful and open-minded. Let me take your stress away with a wonderful experience in Jinja…',
    phone: '+256700000004',
    whatsapp: '256700000004'
  },
  {
    id: '5',
    name: 'Grace',
    slug: 'grace',
    age: 26,
    location: 'Mbarara',
    city: 'Mbarara',
    tier: 'VIP',
    isNew: false,
    isVerified: true,
    status: 'online',
    picsCount: 8,
    vidsCount: 1,
    photoUrl: 'https://spcdn.shortpixel.ai/spio/ret_img+q_cdnize+to_auto+s_webp:avif/ugandaescorts.net/wp-content/uploads/1790593544643/17905953763647-320x480.jpg',
    about: 'Sweet, passionate and full of life. I enjoy good conversations, fine dining and fun evenings…',
    phone: '+256700000005',
    whatsapp: '256700000005'
  },
  {
    id: '6',
    name: 'Nadia',
    slug: 'nadia',
    age: 23,
    location: 'Kawempe, Kampala',
    city: 'Kampala',
    tier: 'VIP',
    isNew: false,
    isVerified: true,
    status: 'recent',
    picsCount: 11,
    vidsCount: 4,
    photoUrl: 'https://spcdn.shortpixel.ai/spio/ret_img+q_cdnize+to_auto+s_webp:avif/ugandaescorts.net/wp-content/uploads/1790597387539/17906024703773-320x480.jpg',
    about: 'I love to laugh and enjoy life to the fullest. Available for hookups, parties and private encounters…',
    phone: '+256700000006',
    whatsapp: '256700000006'
  },

  // ── STANDARD BABES ──
  {
    id: '7',
    name: 'Stella',
    slug: 'stella',
    age: 22,
    location: 'Gulu',
    city: 'Gulu',
    tier: 'Standard',
    isNew: true,
    isVerified: false,
    status: 'online',
    picsCount: 4,
    photoUrl: 'https://spcdn.shortpixel.ai/spio/ret_img+q_cdnize+to_auto+s_webp:avif/ugandaescorts.net/wp-content/uploads/1790305326844/17903053681132-320x480.jpg',
    about: 'Sweet college babe available for discreet hookups and private company in Gulu.',
    phone: '+256700000007',
    whatsapp: '256700000007'
  },
  {
    id: '8',
    name: 'Rita',
    slug: 'rita',
    age: 24,
    location: 'Makindye, Kampala',
    city: 'Kampala',
    tier: 'Standard',
    isNew: false,
    isVerified: true,
    status: 'recent',
    picsCount: 7,
    photoUrl: 'https://spcdn.shortpixel.ai/spio/ret_img+q_cdnize+to_auto+s_webp:avif/ugandaescorts.net/wp-content/uploads/1789553244727/17895532631404-320x480.jpg',
    about: 'Easy-going, lovely smile, and always respectful. Call me anytime in Makindye.',
    phone: '+256700000008',
    whatsapp: '256700000008'
  },
  {
    id: '9',
    name: 'Mercy',
    slug: 'mercy',
    age: 21,
    location: 'Lira',
    city: 'Lira',
    tier: 'Standard',
    isNew: false,
    isVerified: false,
    status: 'recent',
    picsCount: 3,
    photoUrl: 'https://spcdn.shortpixel.ai/spio/ret_img+q_cdnize+to_auto+s_webp:avif/ugandaescorts.net/wp-content/uploads/1785422889280/17854229661824-320x480.jpg',
    about: 'Fun and adventurous girl in Lira town. Contact me on WhatsApp.',
    phone: '+256700000009',
    whatsapp: '256700000009'
  },
  {
    id: '10',
    name: 'Joy',
    slug: 'joy',
    age: 25,
    location: 'Arua',
    city: 'Arua',
    tier: 'Standard',
    isNew: true,
    isVerified: false,
    status: 'online',
    picsCount: 5,
    vidsCount: 2,
    photoUrl: 'https://spcdn.shortpixel.ai/spio/ret_img+q_cdnize+to_auto+s_webp:avif/ugandaescorts.net/wp-content/uploads/1790592895802/17905929115892-320x480.jpg',
    about: 'Curvy and confident babe in Arua. Ready for great company and memories.',
    phone: '+256700000010',
    whatsapp: '256700000010'
  }
];
