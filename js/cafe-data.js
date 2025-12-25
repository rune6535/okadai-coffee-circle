// カフェデータの一元管理
const CAFE_DATA = {
  cafes: [
    {
      id: 1,
      name: "Cafe Mocha",
      area: "岡山駅周辺",
      address: "岡山市北区駅元町1-1",
      coordinates: [34.6617, 133.9183],
      features: ["おしゃれな空間", "作業しやすい"],
      price: 2,
      comment: "広々とした店内で作業に最適。ラテアートも美しい！",
      visitDate: "2025年12月",
      rating: 4.5,
      image: "images/cafe-mocha.jpg",
      instagram: "https://www.instagram.com/okadai_coffee_circle/",
    },
    {
      id: 2,
      name: "珈琲工房 豆香",
      area: "表町・柳川",
      address: "岡山市北区表町1-5-1",
      coordinates: [34.6655, 133.9195],
      features: ["静かで落ち着く", "自家焙煎"],
      price: 3,
      comment: "自家焙煎のこだわりコーヒー。豆の説明も丁寧です。",
      visitDate: "2025年11月",
      rating: 5.0,
      image: "images/cafe-mameka.jpg",
      instagram: "https://www.instagram.com/okadai_coffee_circle/",
    },
    {
      id: 3,
      name: "柳川ロースターズ",
      area: "表町・柳川",
      address: "岡山市北区柳川町2-4",
      coordinates: [34.6666, 133.9199],
      features: ["おしゃれな空間", "スイーツが美味しい"],
      price: 2,
      comment: "焼き菓子とハンドドリップの相性が抜群。",
      visitDate: "2025年10月",
      rating: 4.3,
      image: "images/cafe-yanagawa.jpg",
      instagram: "https://www.instagram.com/okadai_coffee_circle/",
    },
    {
      id: 4,
      name: "奉還町ラボ",
      area: "奉還町",
      address: "岡山市北区奉還町2-7-3",
      coordinates: [34.6674, 133.9147],
      features: ["作業しやすい", "静かで落ち着く"],
      price: 1,
      comment: "電源席が多く、長居しやすい。",
      visitDate: "2025年09月",
      rating: 4.0,
      image: "images/cafe-hokan-lab.jpg",
      instagram: "https://www.instagram.com/okadai_coffee_circle/",
    },
    {
      id: 5,
      name: "Campus Blend",
      area: "大学周辺",
      address: "岡山市北区津島中1-2",
      coordinates: [34.6698, 133.9093],
      features: ["作業しやすい", "スイーツが美味しい"],
      price: 2,
      comment: "学生に人気のラウンジ系カフェ。",
      visitDate: "2025年12月",
      rating: 4.4,
      image: "images/cafe-campus-blend.jpg",
      instagram: "https://www.instagram.com/okadai_coffee_circle/",
    },
    {
      id: 6,
      name: "Station Alley Coffee",
      area: "岡山駅周辺",
      address: "岡山市北区駅前町2-6",
      coordinates: [34.6611, 133.9214],
      features: ["おしゃれな空間", "テラス席あり"],
      price: 2,
      comment: "駅からすぐの路地裏カフェ。夜のライトアップも素敵。",
      visitDate: "2025年08月",
      rating: 4.2,
      image: "images/cafe-station-alley.jpg",
      instagram: "https://www.instagram.com/okadai_coffee_circle/",
    },
    {
      id: 7,
      name: "Terrace Noon",
      area: "岡山駅周辺",
      address: "岡山市北区奉還町1-3-8",
      coordinates: [34.6634, 133.9155],
      features: ["テラス席あり", "おしゃれな空間"],
      price: 3,
      comment: "昼下がりにぴったりの開放的なテラス。",
      visitDate: "2025年07月",
      rating: 4.6,
      image: "images/cafe-terrace-noon.jpg",
      instagram: "https://www.instagram.com/okadai_coffee_circle/",
    },
    {
      id: 8,
      name: "Momotaro Cafe",
      area: "その他のエリア",
      address: "岡山市中区浜3-5",
      coordinates: [34.6792, 133.9302],
      features: ["スイーツが美味しい", "駐車場あり"],
      price: 2,
      comment: "季節のパフェが人気。ドライブの途中に寄りたい一軒。",
      visitDate: "2025年06月",
      rating: 4.1,
      image: "images/cafe-momotaro.jpg",
      instagram: "https://www.instagram.com/okadai_coffee_circle/",
    },
    {
      id: 9,
      name: "岡大ロースタリー",
      area: "大学周辺",
      address: "岡山市北区津島中2-1",
      coordinates: [34.6705, 133.9068],
      features: ["静かで落ち着く", "作業しやすい"],
      price: 1,
      comment: "豆の香りに包まれた隠れ家。",
      visitDate: "2025年05月",
      rating: 4.3,
      image: "images/cafe-okadai-roastery.jpg",
      instagram: "https://www.instagram.com/okadai_coffee_circle/",
    },
    {
      id: 10,
      name: "Book & Bean",
      area: "表町・柳川",
      address: "岡山市北区表町2-6-12",
      coordinates: [34.6648, 133.9212],
      features: ["静かで落ち着く", "作業しやすい"],
      price: 2,
      comment: "本のセレクトが楽しいブックカフェ。",
      visitDate: "2025年04月",
      rating: 4.0,
      image: "images/cafe-book-bean.jpg",
      instagram: "https://www.instagram.com/okadai_coffee_circle/",
    },
    {
      id: 11,
      name: "Garden Brew",
      area: "その他のエリア",
      address: "岡山市南区福田2-9",
      coordinates: [34.6365, 133.9315],
      features: ["テラス席あり", "駐車場あり"],
      price: 3,
      comment: "ガーデン席でゆったり。週末のご褒美に。",
      visitDate: "2025年03月",
      rating: 4.7,
      image: "images/cafe-garden-brew.jpg",
      instagram: "https://www.instagram.com/okadai_coffee_circle/",
    },
    {
      id: 12,
      name: "奉還町スイーツテーブル",
      area: "奉還町",
      address: "岡山市北区奉還町1-9-6",
      coordinates: [34.6668, 133.9129],
      features: ["スイーツが美味しい", "おしゃれな空間"],
      price: 2,
      comment: "手作りケーキが毎日違うのが楽しい。",
      visitDate: "2025年02月",
      rating: 4.2,
      image: "images/cafe-hokan-sweets.jpg",
      instagram: "https://www.instagram.com/okadai_coffee_circle/",
    },
    {
      id: 13,
      name: "Quiet Dock",
      area: "奉還町",
      address: "岡山市北区奉還町3-1-5",
      coordinates: [34.6689, 133.9132],
      features: ["静かで落ち着く", "駐車場あり"],
      price: 1,
      comment: "落ち着いた照明で読書が進みます。",
      visitDate: "2025年01月",
      rating: 4.1,
      image: "images/cafe-quiet-dock.jpg",
      instagram: "https://www.instagram.com/okadai_coffee_circle/",
    },
    {
      id: 14,
      name: "朝日町キッチン",
      area: "その他のエリア",
      address: "岡山市中区朝日町4-2",
      coordinates: [34.6768, 133.9386],
      features: ["スイーツが美味しい", "おしゃれな空間"],
      price: 2,
      comment: "モーニングのパンケーキが人気。",
      visitDate: "2024年12月",
      rating: 4.0,
      image: "images/cafe-asahi-kitchen.jpg",
      instagram: "https://www.instagram.com/okadai_coffee_circle/",
    },
    {
      id: 15,
      name: "Riverline Coffee",
      area: "大学周辺",
      address: "岡山市北区津島南1-4",
      coordinates: [34.6721, 133.9051],
      features: ["おしゃれな空間", "作業しやすい"],
      price: 3,
      comment: "川沿いの景色が気持ちいい。テイクアウトもおすすめ。",
      visitDate: "2024年11月",
      rating: 4.4,
      image: "images/cafe-riverline.jpg",
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
