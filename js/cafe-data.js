// カフェデータの一元管理
const CAFE_DATA = {
  cafes: [
    {
      id: 1,
      name: "en.珈琲焙煎所",
      area: "表町・柳川",
      address: "岡山市北区",
      coordinates: [34.663028061760464, 133.92922319695558],
      features: ["自家焙煎", "落ち着いた空間"],
      price: 3,
      comment: "香り豊かな焙煎豆と丁寧な一杯が魅力です。",
      visitDate: "2026年02月",
      rating: 4.6,
      image: "images/coming-soon.svg",
      instagram: "https://www.instagram.com/okadai_coffee_circle/",
    },
    {
      id: 2,
      name: "cafe moyau",
      area: "岡山駅周辺",
      address: "岡山市北区",
      coordinates: [34.67004481835608, 133.9317590239433],
      features: ["スイーツが美味しい", "おしゃれな空間"],
      price: 2,
      comment: "やさしい雰囲気でゆっくり過ごせるカフェです。",
      visitDate: "2026年02月",
      rating: 4.4,
      image: "images/coming-soon.svg",
      instagram: "https://www.instagram.com/okadai_coffee_circle/",
    },
    {
      id: 3,
      name: "CAFE FILO",
      area: "岡山駅周辺",
      address: "岡山市北区",
      coordinates: [34.6820492211606, 133.91959128161454],
      features: ["作業しやすい", "カフェ巡りにおすすめ"],
      price: 2,
      comment: "コーヒーと軽食が揃う、居心地の良い一軒です。",
      visitDate: "2026年02月",
      rating: 4.3,
      image: "images/coming-soon.svg",
      instagram: "https://www.instagram.com/okadai_coffee_circle/",
    },
    {
      id: 4,
      name: "off.",
      area: "奉還町",
      address: "岡山市北区",
      coordinates: [34.66210089393809, 133.92341386812015],
      features: ["静かで落ち着く", "作業しやすい"],
      price: 2,
      comment: "落ち着いた空気で、ひと息つけるスポットです。",
      visitDate: "2026年02月",
      rating: 4.2,
      image: "images/coming-soon.svg",
      instagram: "https://www.instagram.com/okadai_coffee_circle/",
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
      averageRating: (
        this.cafes.reduce((sum, cafe) => sum + cafe.rating, 0) / this.cafes.length
      ).toFixed(1),
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
