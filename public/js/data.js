// Sport content data - loaded before main.js

const SPORTS_DATA = {
  'kmoove': {
    name: 'Kmoove',
    imageKey: 'kmoove',
    content: `
      <div class="sport-body-text">
        <h2>Kmoove — Le mur interactif</h2>
        <p>Le Kmoove est un mur interactif nouvelle génération : une surface de jeu connectée qui réagit en temps réel aux ballons et aux touchers. Cibles lumineuses, scores affichés en direct, défis chronométrés… l'activité physique devient un véritable jeu vidéo grandeur nature !</p>
        <p>Accessible dès le plus jeune âge et jusqu'aux seniors, le Kmoove permet de travailler la précision, les réflexes, la coordination et l'endurance tout en s'amusant. En solo, en duo ou en équipe, chacun trouve un défi à sa mesure.</p>
        <p>Venez le découvrir et défier vos amis dans notre salle : fous rires et dépassement de soi garantis !</p>
      </div>
    `,
  },
  'vtt': {
    name: 'VTT',
    imageKey: 'vtt',
    pdf: '/pdf/VTT.pdf',
    content: `
      <div class="sport-body-text">
        <h2>VTT</h2>
        <p>Le VTT est une activité sportive qui se pratique en pleine nature. Il permet de découvrir de nouveaux paysages, de se challenger sur des terrains variés et de se dépenser en plein air. Que vous soyez débutant ou confirmé, le VTT est un sport accessible à tous.</p>
      </div>
    `,
  },
  'cyclosport': {
    name: 'Cyclosport',
    imageKey: 'cyclosport',
    pdf: '/pdf/CYCLOSPORT.pdf',
    content: `
      <div class="sport-body-text">
        <h2>Cyclosport</h2>
        <p>La cyclosport est une discipline qui allie cyclisme et courses d'orientation. Elle se pratique en équipe et demande une bonne condition physique et des capacités d'orientation. C'est un sport complet et passionnant.</p>
      </div>
    `,
  },
  'cyclo-cross': {
    name: 'Cyclo-cross',
    imageKey: 'cyclo-cross',
    pdf: '/pdf/CYCLO-CROSS.pdf',
    content: `
      <div class="sport-body-text">
        <h2>Cyclo-cross</h2>
        <p>Le cyclo-cross est une discipline cycliste qui se pratique sur des terrains variés : bitume,herbe, terre, sable, etc. Il s'agit d'une épreuve de résistance qui exige une grande condition physique et une bonne technique de pilotage.</p>
      </div>
    `,
  },
  'tir-a-l-arc': {
    name: 'Tir à l\'arc',
    imageKey: 'tir-a-l-arc',
    pdf: '/pdf/TIR A L\'ARC.pdf',
    content: `
      <div class="sport-body-text">
        <h2>Tir à l'arc</h2>
        <p>Le tir à l'arc est un sport de précision qui se pratique avec un arc et des flèches. Il demande de la concentration, de la souplesse et de la force. C'est un sport qui permet de se dépenser et de se concentrer sur un objectif.</p>
      </div>
    `,
  },
  'moto': {
    name: 'Moto',
    imageKey: 'moto',
    pdf: '/pdf/moto.pdf',
    content: `
      <div class="sport-body-text">
        <h2>Moto</h2>
        <p>La moto est une activité sportive et ludique qui se pratique sur piste ou sur route. Elle demande de la concentration, de la dextérité et une bonne condition physique. C'est un sport passionnant qui permet de vivre des sensations fortes.</p>
      </div>
    `,
  },
  'football': {
    name: 'Football',
    imageKey: 'football',
    pdf: '/pdf/FOOTBALL.pdf',
    content: `
      <div class="sport-body-text">
        <h2>Football</h2>
        <p>Le football est un sport collectif qui se pratique sur un terrain herbeux ou synthétique. Il demande de la vitesse, de l'agilité et une bonne condition physique. C'est un sport qui permet de se dépenser et de vivre une expérience collective.</p>
      </div>
    `,
  },
  'ping-pong': {
    name: 'Ping Pong',
    imageKey: 'ping-pong',
    pdf: '/pdf/Ping Pong.pdf',
    content: `
      <div class="sport-body-text">
        <h2>Ping Pong</h2>
        <p>Le ping-pong est un sport de raquette qui se pratique à deux ou en équipe. Il demande de la dextérité, de la vitesse de réaction et une bonne condition physique. C'est un sport ludique et accessible à tous.</p>
      </div>
    `,
  },
  'ape': {
    name: 'A.P.E',
    imageKey: 'ape',
    pdf: '/pdf/APE.pdf',
    content: `
      <div class="sport-body-text">
        <h2>A.P.E</h2>
        <p>L'A.P.E est une activité sportive qui consiste en des parcours d'obstacles et des épreuves de résistance. Elle demande de la souplesse, de la force et de l'équilibre. C'est un sport complet qui permet de se défier sur des épreuves physiques variées.</p>
      </div>
    `,
  },
  'yoga-qigong': {
    name: 'Yoga & Qi-Gong',
    imageKey: 'yoga-qigong',
    pdf: '/pdf/YOGA & QI-GONG.pdf',
    content: `
      <div class="sport-body-text">
        <h2>Yoga & Qi-Gong</h2>
        <p>Le yoga et le Qi-Gong sont des disciplines qui allient souplesse, force et respiration. Ils permettent de se dépenser, de se concentrer et de se relaxer. C'est une activité sportive complète qui permet de travailler le corps et l'esprit.</p>
      </div>
    `,
  },
  'volley-ball': {
    name: 'Volley-Ball',
    imageKey: 'volley-ball',
    pdf: '/pdf/VOLEY-BALL.pdf',
    content: `
      <div class="sport-body-text">
        <h2>Volley-Ball</h2>
        <p>Le volley-ball est un sport collectif qui se pratique sur un terrain divisé en deux parties. Il demande de la vitesse, de l'agilité et une bonne condition physique. C'est un sport qui permet de se dépenser et de vivre une expérience collective.</p>
      </div>
    `,
  },
  'karting': {
    name: 'Karting piste',
    imageKey: 'karting',
    pdf: '/pdf/Karting.pdf',
    content: `
      <div class="sport-body-text">
        <h2>Karting piste</h2>
        <p>Le karting est une activité sportive et ludique qui se pratique sur une piste. Il demande de la concentration, de la dextérité et une bonne condition physique. C'est un sport passionnant qui permet de vivre des sensations fortes.</p>
      </div>
    `,
  },
  'kart-cross': {
    name: 'Kart cross',
    imageKey: 'kart-cross',
    pdf: '/pdf/KART CROSS.pdf',
    content: `
      <div class="sport-body-text">
        <h2>Kart cross</h2>
        <p>Le kart cross est une variante du karting qui se pratique sur des terrains variés : bitume, sable, herbe, etc. Il demande de la concentration, de la dextérité et une bonne condition physique. C'est un sport passionnant qui permet de vivre des sensations fortes.</p>
      </div>
    `,
  },
  'e-sport': {
    name: 'E-Sport',
    imageKey: 'e-sport',
    pdf: '/pdf/E-SPORT.pdf',
    content: `
      <div class="sport-body-text">
        <h2>E-Sport</h2>
        <p>L'E-Sport est une activité sportive et ludique qui se pratique en ligne. Il demande de la concentration, de la dextérité et une bonne condition physique. C'est un sport passionnant qui permet de vivre des sensations fortes.</p>
      </div>
    `,
  },
};
