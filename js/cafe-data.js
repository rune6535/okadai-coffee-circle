// カフェデータの一元管理
const CAFE_DATA = {
  cafes: [
    {
      id: 1,
      name: "en.珈琲焙煎所",
      area: "表町",
      address: "岡山市北区表町1丁目10-28",
      coordinates: [34.662781, 133.9292232],
      features: ["豆販売あり", "テイクアウトOK"],
      timeSlots: ["昼"],
      comment:
        "お店の中では焙煎機が稼働しており、味はもちろんのこと、待ち時間も楽しくなる素敵なお店でした✨\n今回はソフトクリームとコーヒーを注文しましたが、2つの相性がバッチリでとても美味しいのでおすすめです！\n店内は多数の生豆がズラリと並んでおり、コーヒー好きならテンションあがること間違いなし！",
      visitDate: "2025年12月",
      images: [
        "images/カフェ巡り/vol1_en.珈琲焙煎所/en.珈琲焙煎所_1.jpg",
        "images/カフェ巡り/vol1_en.珈琲焙煎所/en.珈琲焙煎所_2.jpg",
        "images/カフェ巡り/vol1_en.珈琲焙煎所/en.珈琲焙煎所_3.jpg",
        "images/カフェ巡り/vol1_en.珈琲焙煎所/en.珈琲焙煎所_4.jpg",
        "images/カフェ巡り/vol1_en.珈琲焙煎所/en.珈琲焙煎所_5.jpg",
        "images/カフェ巡り/vol1_en.珈琲焙煎所/en.珈琲焙煎所_6.jpg",
      ],
      openingHours: "11:00~18:00",
      closedDays: "毎週火曜日",
      access: "岡山駅から徒歩18分",
      phone: "086-238-7703",
      parking: "なし",
      instagram: "https://www.instagram.com/en.coffee.roastery?igsh=MWw2Mml6MHZ4cjVnYQ==",
      googleMaps:
        "https://www.google.co.jp/maps/place/en.+%E7%8F%88%E7%90%B2%E7%84%99%E7%85%8E%E6%89%80/@34.6627854,133.9266483,17z/data=!3m1!4b1!4m6!3m5!1s0x355407eeec971da9:0x55a5a03fd13456b8!8m2!3d34.662781!4d133.9292232!16s%2Fg%2F11rgrrtvxw?hl=en&entry=ttu&g_ep=EgoyMDI2MDExMy4wIKXMDSoKLDEwMDc5MjA3MUgBUAM%3D",
      hasFood: false,
      reservable: false,
      nameVariants: [
        "en",
        "えん",
        "エン",
        "珈琲",
        "こーひー",
        "コーヒー",
        "焙煎所",
        "ばいせんじょ",
        "バイセンジョ",
      ],
      areaVariants: ["おもてちょう", "オモテチョウ"],
    },
    {
      id: 2,
      name: "moyau",
      area: "岡山城周辺",
      address: "岡山市北区出石町1-10-2",
      coordinates: [34.6696213, 133.9318234],
      features: [],
      timeSlots: ["昼", "夜"],
      comment:
        "店内は落ち着いた雰囲気で、ゆったりとした時間が流れる素敵なカフェでした✨\n1階はテーブル席が並び、2階は座敷となっており窓からは旭川の景色を楽しめます\nまた、店内には「本の部屋」があり自分の好きな本を手に取って楽しむことができます\n今回頼んだ日替わりランチは野菜たっぷりで小鉢も多くとても美味しかったです😋",
      visitDate: "2025年11月",
      images: [
        "images/カフェ巡り/vol2_moyau/moyau_1.jpg",
        "images/カフェ巡り/vol2_moyau/moyau_2.jpg",
        "images/カフェ巡り/vol2_moyau/moyau_3.jpg",
        "images/カフェ巡り/vol2_moyau/moyau_4.jpg",
        "images/カフェ巡り/vol2_moyau/moyau_5.jpg",
      ],
      openingHours: "11:30~18:00(日曜日は16:00まで)",
      closedDays: "毎週木曜日(＋不定休)",
      access: "後楽園から徒歩5分",
      phone: "086-227-2872",
      parking: "なし",
      instagram: "https://www.instagram.com/cafe_moyau?igsh=MWhlNmR2eTFuNHgxdQ==",
      googleMaps:
        "https://www.google.co.jp/maps/place/Cafe+Moyau/@34.6696213,133.9292485,16z/data=!3m1!4b1!4m6!3m5!1s0x3554063b783e6113:0xbdf130a70deeebc2!8m2!3d34.6696213!4d133.9318234!16s%2Fg%2F12qg6q367?hl=en&entry=ttu&g_ep=EgoyMDI2MDExMy4wIKXMDSoKLDEwMDc5MjA3MUgBUAM%3D",
      hasFood: true,
      reservable: false,
      menuHighlight: {
        imageIndex: 2,
        itemName: "オムライス",
        price: "950円",
        menuUrl: "https://www.instagram.com/cafe_moyau",
      },
      nameVariants: ["moyau", "もやう", "モヤウ"],
      areaVariants: ["おかやまじょう", "オカヤマジョウ", "こうらくえん", "コウラクエン"],
    },
    {
      id: 3,
      name: "FILO",
      area: "岡山大学周辺",
      address: "岡山市北区津島新野1丁目1-1",
      coordinates: [34.6819522, 133.9196342],
      features: ["駐車場あり"],
      timeSlots: ["昼", "夜"],
      comment:
        "店内は可愛い装飾やツリーが飾られ、クリスマス仕様になっていました🎄\n今回注文したバスクチーズケーキはとても濃厚で美味しかったです！また、ドリンクのバナナジュースとティラミスラテはボリューミー且つ飲みやすく、とても満足することが出来ました！\nクリスマスシーズンということもあり、店内はお客さんで賑わっていましたが、商品の提供がすばやく接客も優しく丁寧でした！",
      visitDate: "2025年10月",
      images: [
        "images/カフェ巡り/vol3_FILO/FILO_1.jpg",
        "images/カフェ巡り/vol3_FILO/FILO_2.jpg",
        "images/カフェ巡り/vol3_FILO/FILO_3.jpg",
      ],
      openingHours: "11:30~19:30",
      closedDays: "毎週火曜日",
      access: "JFE晴れの国スタジアムから徒歩1分\nJR法界院駅から徒歩12分\nJR岡山駅から車で7分",
      phone: "086-253-2888",
      parking: "あり(お店の前に3台駐車可)",
      instagram: "https://www.instagram.com/cafe.filo_?igsh=NWFudWVjNjBpMWtl",
      googleMaps:
        "https://www.google.co.jp/maps/place/Cafe+Filo/@34.6819522,133.9170593,17z/data=!3m1!4b1!4m6!3m5!1s0x3554078ac9af957b:0x5424f2b2ba1f11e1!8m2!3d34.6819522!4d133.9196342!16s%2Fg%2F11kh3xv7hr?hl=en&entry=ttu&g_ep=EgoyMDI2MDExMy4wIKXMDSoKLDEwMDc5MjA3MUgBUAM%3D",
      hasFood: false,
      reservable: true,
      nameVariants: ["FILO", "ふぃろ", "フィロ", "filo"],
      areaVariants: ["おかやまだいがく", "オカヤマダイガク", "だいがく", "ダイガク", "つしま", "ツシマ"],
    },
    {
      id: 4,
      name: "off.",
      area: "岡山駅周辺",
      address: "岡山市北区田町1丁目7-24",
      coordinates: [34.6619862, 133.9234246],
      features: [],
      timeSlots: ["昼", "夜", "深夜"],
      comment:
        "駅からも歩きやすい立地で遅くまで営業してくれるのが嬉しいポイントです✨\n\n名物はバスクチーズケーキなどの自家製スイーツで、クラシックが流れる落ち着いた空間で味わうひとときが最高でした！\n\nお仕事帰りでも、週末のリラックスタイムでも、ぜひ立ち寄ってほしいおすすめカフェです！",
      visitDate: "2025年9月",
      images: [
        "images/カフェ巡り/vol4_off./off._1.jpg",
        "images/カフェ巡り/vol4_off./off._2.jpg",
        "images/カフェ巡り/vol4_off./off._3.jpg",
        "images/カフェ巡り/vol4_off./off._4.jpg",
        "images/カフェ巡り/vol4_off./off._5.jpg",
        "images/カフェ巡り/vol4_off./off._6.jpg",
      ],
      openingHours: "15:00~25:00",
      closedDays: "不定休",
      access: "岡山駅から徒歩11分",
      phone: null,
      parking: "なし",
      instagram: "https://www.instagram.com/off.okayama?igsh=aGN4aWVwMndqYzFi",
      googleMaps:
        "https://www.google.co.jp/maps/place/off.okayama/@34.6619862,133.9208497,17z/data=!3m2!4b1!5s0x35540635e71056e1:0xadd43af821971ac8!4m6!3m5!1s0x3554070003d6f917:0x97d33ffe61196f03!8m2!3d34.6619862!4d133.9234246!16s%2Fg%2F11x1nsdt7s?hl=en&entry=ttu&g_ep=EgoyMDI2MDExMy4wIKXMDSoKLDEwMDc5MjA3MUgBUAM%3D",
      hasFood: false,
      reservable: false,
      nameVariants: ["off", "おふ", "オフ"],
      areaVariants: ["おかやまえき", "オカヤマエキ", "えきしゅうへん", "エキシュウヘン"],
    },
    {
      id: 5,
      name: "nes",
      area: "岡山駅周辺",
      address: "岡山市北区富田町2丁目9-1",
      coordinates: [34.669281, 133.925434],
      features: [],
      timeSlots: ["昼", "夜", "深夜"],
      comment:
        "店内は美術館の展示室のような雰囲気で、落ち着いた時間を過ごすことができました✨\n\nチーズケーキはなめらかな口当たりで、上品な甘さでした！\nまた、コーヒーの苦味がチーズケーキの甘みを引き締めてくれるため、最後まで飽きることなく楽しむことができました😋\n\n夜遅くまで営業されておりアルコール提供もあるため、夜カフェとしてもおすすめです！",
      visitDate: "2025年8月",
      images: [
        "images/カフェ巡り/vol5_nes/nes_1.jpg",
        "images/カフェ巡り/vol5_nes/nes_2.jpg",
        "images/カフェ巡り/vol5_nes/nes_3.jpg",
        "images/カフェ巡り/vol5_nes/nes_4.jpg",
        "images/カフェ巡り/vol5_nes/nes_5.jpg",
        "images/カフェ巡り/vol5_nes/nes_6.jpg",
      ],
      openingHours: "13:00~24:00",
      closedDays: "毎週水曜日",
      access: "岡山駅から徒歩11分",
      phone: null,
      parking: "なし",
      instagram: "https://www.instagram.com/n_eee_ss?igsh=ZXkwZGNzNWNyZDFl",
      googleMaps:
        "https://www.google.co.jp/maps/place/nes/@34.669281,133.9228591,17z/data=!3m1!4b1!4m6!3m5!1s0x355407f52500d0e3:0x51ccf9d55fbdbe9d!8m2!3d34.669281!4d133.925434!16s%2Fg%2F11xmq7qdsf?hl=en&entry=ttu&g_ep=EgoyMDI2MDExMy4wIKXMDSoKLDEwMDc5MjA3MUgBUAM%3D",
      hasFood: false,
      reservable: false,
      nameVariants: ["nes", "ねす", "ネス"],
      areaVariants: ["おかやまえき", "オカヤマエキ", "えきしゅうへん", "エキシュウヘン"],
    },
    {
      id: 6,
      name: "ONSAYA COFFEE",
      area: "奉還町",
      address: "岡山県岡山市北区奉還町2丁目9-1",
      coordinates: [34.665, 133.915],
      features: ["豆販売あり"],
      timeSlots: ["昼"],
      comment: "現在更新中です。",
      visitDate: "2025年7月",
      images: ["images/coming-soon.svg"],
      openingHours: "11:00～18:00",
      closedDays: "不定休",
      access: "岡山駅から徒歩約6分",
      phone: null,
      parking: "なし",
      instagram: "https://www.instagram.com/onsayacoffee/",
      googleMaps:
        "https://www.google.com/maps/place/ONSAYACOFFEE+%E5%A5%89%E9%82%84%E7%94%BA%E6%9C%AC%E5%BA%97/@34.6690762,133.8822913,14z/data=!4m10!1m2!2m1!1z44Kq44Oz44K144Ok44Kz44O844OS44O8!3m6!1s0x3554064e030b1733:0xba02093b46b8c502!8m2!3d34.6690674!4d133.9152527!15sChjjgqrjg7PjgrXjg6TjgrPjg7zjg5Ljg7xaHCIa44Kq44OzIOOCteODpCDjgrPjg7zjg5Ljg7ySAQtjb2ZmZWVfc2hvcOABAA!16s%2Fg%2F1v3gpr6m?entry=ttu&g_ep=EgoyMDI2MDMxMS4wIKXMDSoASAFQAw%3D%3D",
      hasFood: false,
      reservable: false,
      nameVariants: ["ONSAYA", "おんさや", "オンサヤ", "COFFEE", "こーひー", "コーヒー"],
      areaVariants: ["ほうかんちょう", "ホウカンチョウ"],
    },
    {
      id: 7,
      name: "EMPIRE COFFEE ROASTERS",
      area: "奉還町",
      address: "岡山県岡山市北区奉還町1丁目12-2 2F",
      coordinates: [34.66946980331396, 133.91934071229772],
      features: ["豆販売あり"],
      timeSlots: ["朝", "昼"],
      comment: "現在更新中です。",
      visitDate: "2025年6月",
      images: ["images/coming-soon.svg"],
      openingHours: "9:30～17:30",
      closedDays: "火曜日",
      access: "岡山駅から徒歩約5分",
      phone: null,
      parking: "なし",
      instagram: "https://www.instagram.com/empire_coffee_roasters/",
      googleMaps:
        "https://www.google.com/maps/place/%E3%82%A8%E3%83%B3%E3%83%91%E3%82%A4%E3%82%A2%E3%82%B3%E3%83%BC%E3%83%92%E3%83%BC%E3%83%AD%E3%83%BC%E3%82%B9%E3%82%BF%E3%83%BC%E3%82%BA/@34.669311,133.9167229,17z/data=!3m1!4b1!4m6!3m5!1s0x3554064f28e2834d:0x548d4ada57d373df!8m2!3d34.669311!4d133.9192978!16s%2Fg%2F11ggblbrhd?entry=ttu&g_ep=EgoyMDI2MDMxMS4wIKXMDSoASAFQAw%3D%3D",
      hasFood: false,
      reservable: false,
      nameVariants: ["EMPIRE", "えんぱいあ", "エンパイア", "COFFEE", "こーひー", "コーヒー"],
      areaVariants: ["ほうかんちょう", "ホウカンチョウ"],
    },
    {
      id: 8,
      name: "COUNTER COFFEE COUNTER",
      area: "岡山駅周辺",
      address: "岡山県岡山市北区柳町2丁目1-1 山陽新聞社本社ビル1階",
      coordinates: [34.658167425994215, 133.9195636392848],
      features: ["テイクアウトOK"],
      timeSlots: ["朝", "昼"],
      comment: "現在更新中です。",
      visitDate: "2025年5月",
      images: ["images/coming-soon.svg"],
      openingHours: "7:30～17:30 (l.o.17:00)",
      closedDays: "不定休",
      access: "岡山駅から徒歩約12分",
      phone: null,
      parking: "なし",
      instagram: "https://www.instagram.com/counter_coffee_counter/",
      googleMaps:
        "https://www.google.com/maps/place/COUNTER+COFFEE+COUNTER/@34.657938,133.9170102,16z/data=!3m1!4b1!4m6!3m5!1s0x355407002603aac9:0xa25b40ce81f6c35c!8m2!3d34.657938!4d133.9195851!16s%2Fg%2F11ynpd1hxv?entry=ttu&g_ep=EgoyMDI2MDMxMS4wIKXMDSoASAFQAw%3D%3D",
      hasFood: false,
      reservable: false,
      nameVariants: ["COUNTER", "かうんたー", "カウンター", "COFFEE", "こーひー", "コーヒー"],
      areaVariants: ["おかやまえき", "オカヤマエキ", "えきしゅうへん", "エキシュウヘン"],
    },
    {
      id: 9,
      name: "ごはんとおやつ iro",
      area: "岡山駅周辺",
      address: "岡山県岡山市北区下中野351-115",
      coordinates: [34.67046772047364, 133.9251105392851],
      features: [],
      timeSlots: ["昼"],
      comment:
        "⏱11:00～15:00がおひるごはんの時間\n⏱14:00～18:00がおやつの時間\nと時間帯でメニューが分かれています。今回はおひるごはんの時間にお邪魔しました！\n\n11時ぴったりに行くとスムーズに入店できました✨\n予約はできないため、早めの来店がおすすめです！\n\nランチはご飯の量を「少なめ・普通・大盛り（＋100円）」から選べるのが嬉しいポイント。ボリュームも調整できて大満足でした！\n\nおやつのレアチーズケーキはなめらかで上品な甘さ。コーヒーのほどよい苦味が甘みを引き締めてくれて、相性抜群でした☕️\n\n店内は落ち着いた雰囲気で、ゆっくりとした時間を過ごせます。店員さんの接客も丁寧で、とても心地よい空間でした。\n\n気になる方はぜひ足を運んでみてください😊",
      visitDate: "2025年4月",
      images: ["images/coming-soon.svg"],
      openingHours: "11:00~18:00",
      closedDays: "不定休",
      access: "",
      phone: null,
      parking: "なし",
      instagram: "https://www.instagram.com/gohantooyatsu.iro/?hl=ja",
      googleMaps:
        "https://www.google.com/maps/place/%E3%81%94%E3%81%AF%E3%82%93%E3%81%A8%E3%81%8A%E3%82%84%E3%81%A4+iro/@34.6702648,133.9225571,17z/data=!3m2!4b1!5s0x3554063870251a7b:0x1352b9442b4841b0!4m6!3m5!1s0x35540786c6a91f43:0x53af5ef3b487e4df!8m2!3d34.6702648!4d133.925132!16s%2Fg%2F11k3ljtx46?entry=ttu&g_ep=EgoyMDI2MDMxMS4wIKXMDSoASAFQAw%3D%3D",
      hasFood: true,
      reservable: false,
      nameVariants: ["iro", "いろ", "イロ", "ごはんとおやつ"],
      areaVariants: ["おかやまえき", "オカヤマエキ", "えきしゅうへん", "エキシュウヘン"],
    },
    {
      id: 10,
      name: "AROMA COFFEE ROASTERY",
      area: "その他",
      address: "岡山県岡山市北区中山下1丁目5-38",
      coordinates: [34.63919185007266, 133.90124351229673],
      features: ["駐車場あり", "豆販売あり", "テイクアウトOK"],
      timeSlots: ["朝", "昼"],
      comment: "現在更新中です。",
      visitDate: "2025年3月",
      images: ["images/coming-soon.svg"],
      openingHours: "10:00～18:00",
      closedDays: "月曜日＋第1日曜日",
      access: "JR備前西市駅から徒歩約13分",
      phone: "未登録",
      parking: "あり",
      instagram: "https://www.instagram.com/aroma_coffee_roastery/",
      googleMaps:
        "https://www.google.com/maps/place/%E3%82%A2%E3%83%AD%E3%83%9E%E3%82%B3%E3%83%BC%E3%83%92%E3%83%BC%E3%83%AD%E3%83%BC%E3%82%B9%E3%82%BF%E3%83%AA%E3%83%BC/@34.6388575,133.7693596,12z/data=!4m10!1m2!2m1!1z44Ki44Ot44Oe44Kz44O844OS44O8!3m6!1s0x3554077eae582ef3:0xb687d727347c7a5e!8m2!3d34.6388741!4d133.9012006!15sChXjgqLjg63jg57jgrPjg7zjg5Ljg7xaGCIW44Ki44Ot44OeIOOCs-ODvOODkuODvJIBFmZvb2RfcHJvZHVjdHNfc3VwcGxpZXLgAQA!16s%2Fg%2F12hyxb508?entry=ttu&g_ep=EgoyMDI2MDMxMS4wIKXMDSoASAFQAw%3D%3D",
      hasFood: false,
      reservable: false,
      nameVariants: ["AROMA", "アロマ", "あろま", "AROMA COFFEE ROASTERY", "アロマコーヒーロースタリー", "下中野"],
      areaVariants: ["その他", "そのた"],
    },
    {
      id: 11,
      name: "キヤッスル",
      area: "表町",
      address: "岡山市北区",
      coordinates: [34.66411303807553, 133.927937896956],
      features: ["ご飯あり"],
      timeSlots: ["朝", "昼"],
      comment: "現在更新中です。",
      visitDate: "2026年3月",
      images: ["images/coming-soon.svg"],
      openingHours: "8:30～18:00",
      closedDays: "日曜日",
      access: "岡山駅から徒歩15分",
      phone: "未登録",
      parking: "なし",
      instagram: null,
      googleMaps:
        "https://www.google.com/maps/place/%E3%82%AD%E3%83%A4%E3%83%83%E3%82%B9%E3%83%AB/@34.6639454,133.925363,17z/data=!3m1!4b1!4m6!3m5!1s0x35540636946187ab:0xb885fa2700dcd029!8m2!3d34.6639454!4d133.9279379!16s%2Fg%2F1wj_3wj4?entry=ttu&g_ep=EgoyMDI2MDMxMS4wIKXMDSoASAFQAw%3D%3D",
      hasFood: false,
      reservable: false,
      nameVariants: ["キヤッスル", "きやっする", "キャッスル"],
      areaVariants: ["おもてちょう", "オモテチョウ"],
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
    this._cafesWithDistances = null;
  },
};

// 基準地点の座標
const REFERENCE_POINTS = {
  station: {
    name: "岡山駅",
    coordinates: [34.66655797257619, 133.91773349699008],
  },
  omotoStation: {
    name: "大元駅",
    coordinates: [34.647770926664016, 133.91099310293703],
  },
  university: {
    name: "岡山大学",
    coordinates: [34.68724223530956, 133.9222190258267],
  },
};

// 2点間の距離を計算（Haversine formula）
const calculateDistance = (coord1, coord2) => {
  const radius = 6371;
  const [lat1, lon1] = coord1.map((v) => (v * Math.PI) / 180);
  const [lat2, lon2] = coord2.map((v) => (v * Math.PI) / 180);
  const dLat = lat2 - lat1;
  const dLon = lon2 - lon1;
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return radius * c;
};

const enrichCafesWithDistances = (cafes) =>
  cafes.map((cafe) => ({
    ...cafe,
    distanceFromStation: calculateDistance(cafe.coordinates, REFERENCE_POINTS.station.coordinates),
    distanceFromUniversity: calculateDistance(
      cafe.coordinates,
      REFERENCE_POINTS.university.coordinates
    ),
  }));

CAFE_DATA.referencePoints = REFERENCE_POINTS;
CAFE_DATA.getCafesWithDistances = function getCafesWithDistances() {
  if (!this._cafesWithDistances) {
    this._cafesWithDistances = enrichCafesWithDistances(this.cafes);
  }
  return this._cafesWithDistances;
};

// グローバルに公開
if (typeof window !== "undefined") {
  window.CAFE_DATA = CAFE_DATA;
}
