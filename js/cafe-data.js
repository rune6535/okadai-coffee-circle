// カフェデータの一元管理
const CAFE_DATA = {
  cafes: [
    {
      id: 1,
      name: "en.珈琲焙煎所",
      area: "表町・柳川",
      address: "岡山市北区表町1丁目10-28",
      coordinates: [34.662781, 133.9292232],
      features: ["おしゃれな空間", "静かで落ち着く"],
      price: 2,
      comment:
        "自家焙煎のスペシャルティコーヒーを楽しめるお店。豆の説明も丁寧で、コーヒー好きにはたまらない空間です。",
      visitDate: "2025年12月",
      images: [
        "images/カフェ巡り/vol1_en.珈琲焙煎所/en.珈琲焙煎所_1.jpg",
        "images/カフェ巡り/vol1_en.珈琲焙煎所/en.珈琲焙煎所_2.jpg",
        "images/カフェ巡り/vol1_en.珈琲焙煎所/en.珈琲焙煎所_3.jpg",
        "images/カフェ巡り/vol1_en.珈琲焙煎所/en.珈琲焙煎所_4.jpg",
        "images/カフェ巡り/vol1_en.珈琲焙煎所/en.珈琲焙煎所_5.jpg",
        "images/カフェ巡り/vol1_en.珈琲焙煎所/en.珈琲焙煎所_6.jpg"
      ],
      openingHours: "11:00~18:00",
      closedDays: "毎週火曜日",
      access: "岡山駅から徒歩18分",
      phone: "086-238-7703",
      parking: "なし",
      instagram: "https://www.instagram.com/en.coffee.roastery?igsh=MWw2Mml6MHZ4cjVnYQ==",
      googleMaps:
        "https://www.google.co.jp/maps/place/en.+%E7%8F%88%E7%90%B2%E7%84%99%E7%85%8E%E6%89%80/@34.6627854,133.9266483,17z/data=!3m1!4b1!4m6!3m5!1s0x355407eeec971da9:0x55a5a03fd13456b8!8m2!3d34.662781!4d133.9292232!16s%2Fg%2F11rgrrtvxw?hl=en&entry=ttu&g_ep=EgoyMDI2MDExMy4wIKXMDSoKLDEwMDc5MjA3MUgBUAM%3D",
      hasFood: true,
      nightOpen: false,
      reservable: false,
    },
    {
      id: 2,
      name: "cafe moyau",
      area: "岡山駅周辺",
      address: "岡山市北区出石町1-10-2",
      coordinates: [34.67004481835608, 133.9317590239433],
      features: ["スイーツが美味しい", "おしゃれな空間"],
      price: 2,
      comment: "やさしい雰囲気でゆっくり過ごせるカフェです。",
      visitDate: "2026年02月",
      images: [
        "images/カフェ巡り/vol2_moyau/moyau_1.jpg",
        "images/カフェ巡り/vol2_moyau/moyau_2.jpg",
        "images/カフェ巡り/vol2_moyau/moyau_3.jpg",
        "images/カフェ巡り/vol2_moyau/moyau_4.jpg",
        "images/カフェ巡り/vol2_moyau/moyau_5.jpg"
      ],
      openingHours: "11:30~18:00(日曜日は16:00まで)",
      closedDays: "毎週木曜日(+不定休)",
      access: "後楽園から徒歩5分",
      phone: "086-227-2872",
      parking: "なし",
      instagram: "https://www.instagram.com/cafe_moyau?igsh=MWhlNmR2eTFuNHgxdQ==",
      googleMaps:
        "https://www.google.co.jp/maps/place/Cafe+Moyau/@34.6696213,133.9292485,16z/data=!3m1!4b1!4m6!3m5!1s0x3554063b783e6113:0xbdf130a70deeebc2!8m2!3d34.6696213!4d133.9318234!16s%2Fg%2F12qg6q367?hl=en&entry=ttu&g_ep=EgoyMDI2MDExMy4wIKXMDSoKLDEwMDc5MjA3MUgBUAM%3D",
      hasFood: true,
      nightOpen: false,
      reservable: false,
    },
    {
      id: 3,
      name: "CAFE FILO",
      area: "岡山駅周辺",
      address: "岡山市北区津島新野1丁目1-1",
      coordinates: [34.6820492211606, 133.91959128161454],
      features: ["作業しやすい", "カフェ巡りにおすすめ"],
      price: 2,
      comment: "コーヒーと軽食が揃う、居心地の良い一軒です。",
      visitDate: "2026年02月",
      images: [
        "images/カフェ巡り/vol3_FILO/FILO_1.jpg",
        "images/カフェ巡り/vol3_FILO/FILO_2.jpg",
        "images/カフェ巡り/vol3_FILO/FILO_3.jpg"
      ],
      openingHours: "11:30~19:30",
      closedDays: "毎週火曜日",
      access:
        "JFE晴れの国スタジアムから徒歩1分 / JR法界院駅から徒歩12分 / JR岡山駅から車で7分",
      phone: "086-253-2888",
      parking: "あり(お店の前に3台駐車可)",
      instagram: "https://www.instagram.com/cafe.filo_?igsh=NWFudWVjNjBpMWtl",
      googleMaps:
        "https://www.google.co.jp/maps/place/Cafe+Filo/@34.6819522,133.9170593,17z/data=!3m1!4b1!4m6!3m5!1s0x3554078ac9af957b:0x5424f2b2ba1f11e1!8m2!3d34.6819522!4d133.9196342!16s%2Fg%2F11kh3xv7hr?hl=en&entry=ttu&g_ep=EgoyMDI2MDExMy4wIKXMDSoKLDEwMDc5MjA3MUgBUAM%3D",
      hasFood: false,
      nightOpen: false,
      reservable: false,
    },
    {
      id: 4,
      name: "off.",
      area: "奉還町",
      address: "岡山市北区田町1丁目7-24",
      coordinates: [34.66210089393809, 133.92341386812015],
      features: ["静かで落ち着く", "作業しやすい"],
      price: 2,
      comment: "落ち着いた空気で、ひと息つけるスポットです。",
      visitDate: "2026年02月",
      images: [
        "images/カフェ巡り/vol4_off./off._1.jpg",
        "images/カフェ巡り/vol4_off./off._2.jpg",
        "images/カフェ巡り/vol4_off./off._3.jpg",
        "images/カフェ巡り/vol4_off./off._4.jpg",
        "images/カフェ巡り/vol4_off./off._5.jpg",
        "images/カフェ巡り/vol4_off./off._6.jpg"
      ],
      openingHours: "15:00~25:00",
      closedDays: "不定休",
      access: "岡山駅から徒歩11分",
      phone: "未登録",
      parking: "なし",
      instagram: "https://www.instagram.com/off.okayama?igsh=aGN4aWVwMndqYzFi",
      googleMaps:
        "https://www.google.co.jp/maps/place/off.okayama/@34.6619862,133.9208497,17z/data=!3m2!4b1!5s0x35540635e71056e1:0xadd43af821971ac8!4m6!3m5!1s0x3554070003d6f917:0x97d33ffe61196f03!8m2!3d34.6619862!4d133.9234246!16s%2Fg%2F11x1nsdt7s?hl=en&entry=ttu&g_ep=EgoyMDI2MDExMy4wIKXMDSoKLDEwMDc5MjA3MUgBUAM%3D",
      hasFood: false,
      nightOpen: false,
      reservable: false,
    },
    {
      id: 5,
      name: "ONSAYA COFFEE 奉還町本店",
      area: "奉還町",
      address: "岡山市北区",
      coordinates: [34.669261499484264, 133.91537071414615],
      features: ["落ち着いた空間", "待ち合わせに便利"],
      price: 2,
      comment: "街歩きの合間に立ち寄りやすい一軒です。",
      visitDate: "2026年02月",
      images: ["images/coming-soon.svg"],
      openingHours: "未登録",
      closedDays: "未登録",
      access: "未登録",
      phone: "未登録",
      parking: "未登録",
      instagram: "https://www.instagram.com/okadai_coffee_circle/",
      googleMaps: "",
      hasFood: true,
      nightOpen: false,
      reservable: false,
    },
    {
      id: 6,
      name: "EMPIRE COFFEE ROASTERS",
      area: "奉還町",
      address: "岡山市北区",
      coordinates: [34.66962863339259, 133.9192334239431],
      features: ["自家焙煎", "香りが良い"],
      price: 3,
      comment: "焙煎の香りが楽しめるコーヒー好きに人気のスポットです。",
      visitDate: "2026年02月",
      images: ["images/coming-soon.svg"],
      openingHours: "未登録",
      closedDays: "未登録",
      access: "未登録",
      phone: "未登録",
      parking: "未登録",
      instagram: "https://www.instagram.com/okadai_coffee_circle/",
      googleMaps: "",
      hasFood: false,
      nightOpen: true,
      reservable: false,
    },
    {
      id: 7,
      name: "nes",
      area: "岡山駅周辺",
      address: "岡山市北区富田町2丁目9-1",
      coordinates: [34.66946627508196, 133.92543399695583],
      features: ["おしゃれな空間", "ゆったり過ごせる"],
      price: 2,
      comment: "落ち着いた空間でゆっくりコーヒーを楽しめます。",
      visitDate: "2026年02月",
      images: ["images/カフェ巡り/カフェ巡り_vol5.jpg"],
      openingHours: "13:00~24:00",
      closedDays: "毎週水曜日",
      access: "岡山駅から徒歩11分",
      phone: "未登録",
      parking: "なし",
      instagram: "https://www.instagram.com/n_eee_ss?igsh=ZXkwZGNzNWNyZDFl",
      googleMaps:
        "https://www.google.co.jp/maps/place/nes/@34.669281,133.9228591,17z/data=!3m1!4b1!4m6!3m5!1s0x355407f52500d0e3:0x51ccf9d55fbdbe9d!8m2!3d34.669281!4d133.925434!16s%2Fg%2F11xmq7qdsf?hl=en&entry=ttu&g_ep=EgoyMDI2MDExMy4wIKXMDSoKLDEwMDc5MjA3MUgBUAM%3D",
      hasFood: false,
      nightOpen: false,
      reservable: false,
    },
    {
      id: 8,
      name: "ごはんとおやつiro",
      area: "岡山駅周辺",
      address: "岡山市北区",
      coordinates: [34.6707589052107, 133.9252607429816],
      features: ["手作りおやつ", "落ち着いた空間"],
      price: 2,
      comment: "手作りのおやつと優しい雰囲気が魅力のお店です。",
      visitDate: "2026年02月",
      images: ["images/coming-soon.svg"],
      openingHours: "未登録",
      closedDays: "未登録",
      access: "未登録",
      phone: "未登録",
      parking: "未登録",
      instagram: "https://www.instagram.com/okadai_coffee_circle/",
      googleMaps: "",
      hasFood: true,
      nightOpen: false,
      reservable: false,
    },
    {
      id: 9,
      name: "AROMA COFFEE ROASTERY",
      area: "表町・柳川",
      address: "岡山市北区",
      coordinates: [34.63919185007266, 133.90124351229673],
      features: ["自家焙煎", "香りが良い"],
      price: 3,
      comment: "焙煎の香りに包まれてコーヒーを楽しめます。",
      visitDate: "2026年02月",
      images: ["images/coming-soon.svg"],
      openingHours: "未登録",
      closedDays: "未登録",
      access: "未登録",
      phone: "未登録",
      parking: "未登録",
      instagram: "https://www.instagram.com/okadai_coffee_circle/",
      googleMaps: "",
      hasFood: false,
      nightOpen: false,
      reservable: false,
    },
    {
      id: 10,
      name: "COUNTER COFFEE COUNTER",
      area: "奉還町",
      address: "岡山市北区",
      coordinates: [34.65820272640846, 133.9194778086011],
      features: ["コーヒー専門", "静かに過ごせる"],
      price: 3,
      comment: "コーヒーをじっくり味わえるカウンター席が魅力です。",
      visitDate: "2026年02月",
      images: ["images/coming-soon.svg"],
      openingHours: "未登録",
      closedDays: "未登録",
      access: "未登録",
      phone: "未登録",
      parking: "未登録",
      instagram: "https://www.instagram.com/okadai_coffee_circle/",
      googleMaps: "",
      hasFood: false,
      nightOpen: false,
      reservable: true,
    },
  ],

  // 統計情報を自動計算
  getStats() {
    const parseVisitDate = (value) => {
      const match = value.match(/(\d{4})年(\d{1,2})月/);
      if (!match) {
        return 0;
      }
      const year = Number(match[1]);
      const month = Number(match[2]);
      return new Date(year, month - 1, 1).getTime();
    };

    const latestVisit = this.cafes.reduce((latest, cafe) => {
      if (!latest) {
        return cafe.visitDate;
      }
      return parseVisitDate(cafe.visitDate) > parseVisitDate(latest) ? cafe.visitDate : latest;
    }, "");

    return {
      totalCafes: this.cafes.length,
      areas: [...new Set(this.cafes.map((cafe) => cafe.area))].length,
      latestVisit,
    };
  },

  // エリア別カフェ数
  getCafesByArea() {
    return this.cafes.reduce((acc, cafe) => {
      acc[cafe.area] = (acc[cafe.area] || 0) + 1;
      return acc;
    }, {});
  },

  // カフェを追加
  addCafe(cafeData) {
    const newId = Math.max(...this.cafes.map((cafe) => cafe.id)) + 1;
    this.cafes.push({ id: newId, ...cafeData });
  },
};

// グローバルに公開
if (typeof window !== "undefined") {
  window.CAFE_DATA = CAFE_DATA;
}
