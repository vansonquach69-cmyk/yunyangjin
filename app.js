/* 云阳烬 · 九歌拾遗：韩非线 —— 视觉小说式剧情引擎
 * 每幕由多个 beat（旁白/对白/抉择）组成；选择后播放角色即时反应，再汇合。
 * 剧情数据写死，后续可将 beat 文本生成替换为大模型 API。
 */

const INITIAL_STATE = {
  trust: 25, korea: 40, mind: 55, dev: 0,
  zhuang: 0, zhang: 0, zinv: 0, honglian: 0, lisi: 0,
  tags: [], final: null
};
let state = { ...INITIAL_STATE, tags: [] };

const EFFECT_LABELS = {
  trust: "流沙信任", korea: "韩国局势", mind: "韩非心志", dev: "史实偏离",
  zhuang: "卫庄", zhang: "张良", zinv: "紫女", honglian: "红莲", lisi: "李斯"
};

const TONE = {
  韩非: "", 卫庄: "zhuang", 紫女: "zinv", 张良: "zhang",
  红莲: "honglian", 李斯: "lisi", 嬴政: "yingzheng", "": "system"
};

const PORTRAITS = {
  韩非: "assets/portraits/hanfei.png",
  卫庄: "assets/portraits/weizhuang.png",
  紫女: "assets/portraits/zinv.png",
  张良: "assets/portraits/zhangliang.png",
  红莲: "assets/portraits/honglian.png",
  李斯: "assets/portraits/lisi.png",
  嬴政: "assets/portraits/yingzheng.png"
};

/* ==================== 剧情数据 ==================== */

const STORY = {
  start: {
    act: "prologue",
    chapter: "序 · 新郑雨夜",
    scene: "新郑 · 紫兰轩外",
    beats: [
      { t: "epigraph", text: "天下无常\n聚散流沙\n逝者如川\n天行九歌" },
      { t: "narr", text: "周赧王已矣，七雄之势日蹙。秦师东出，如黑云压城；韩国积弱，正如风中残烛。" },
      { t: "narr", text: "这一夜，新郑的雨下得没有尽头。雨脚敲在紫兰轩的瓦上，敲在韩都斑驳的城墙上，也敲在一卷尚未写完的竹简上。" },
      { t: "dlg", who: "紫女", text: "雨下成这样，你还是来了。" },
      { t: "dlg", who: "韩非", text: "新郑的雨，我听了二十几年。再不听，怕以后想听也听不到了。" },
      { t: "dlg", who: "紫女", text: "今夜紫兰轩只留了一盏灯。你若再晚来一刻，我便当你不来了。" },
      { t: "dlg", who: "韩非", text: "灯在，人就会来。我只是没想到，除了我，还有人等着这盏灯。" },
      { t: "narr", text: "他抖落蓑衣上的雨，看见灯下还坐着两个人：一个按剑不语，一个握着笔，年轻得像还没长齐羽毛的鹰。" },
      { t: "dlg", who: "韩非", text: "卫庄兄，子房。看来今夜这局棋，不只是我一个人想下。" },
      { t: "narr", text: "三人的目光都落在他身上。雨还在下，灯还在燃。这一局，落不落子，都已经在局中。" },
      { t: "choice", choices: [
        {
          text: "这一局，我陪你们下。",
          note: "入局",
          addTags: ["流沙可恃"],
          effects: { mind: 3, trust: 5 },
          beats: [
            { t: "narr", text: "韩非举杯，向灯下三人各敬了一寸。" },
            { t: "dlg", who: "韩非", text: "七国的天下，我要九十九。可这第一子，得先落在新郑。" }
          ]
        },
        {
          text: "若这局棋注定输呢？",
          note: "问心",
          addTags: ["知其不可"],
          effects: { mind: -3 },
          beats: [
            { t: "dlg", who: "卫庄", text: "输也比不下好。" },
            { t: "dlg", who: "韩非", text: "……说得好。输也比不下好。" }
          ]
        },
        {
          text: "紫女姑娘，再斟一杯。今夜不走了。",
          note: "留人",
          addTags: ["灯下留人"],
          effects: { zinv: 3, mind: 2 },
          beats: [
            { t: "narr", text: "紫女没有说话，只替他斟满了酒。卫庄看了韩非一眼，松开了按剑的手。" }
          ]
        }
      ]}
    ],
    cta: "落子入局",
    historyNote: {
      fact: "韩非为韩国宗室公子，与李斯同受业于荀卿（荀子），学刑名法术之学，而其学归本于黄老。他见韩国日益削弱，多次上书韩王图谋富强，韩王终不能用，于是发愤著书，作《孤愤》《五蠹》《说难》等篇。其生年史无确载，卒于秦王政十四年（公元前233年）。\n依据：《史记·老子韩非列传》。",
      fiction: "紫兰轩、与卫庄/张良/紫女相识、军饷失窃案及“流沙”初创等情节，均为《天行九歌》的艺术虚构，史无明载。开篇年代取“学成归韩”前后，为戏剧处理，非确指某年。"
    }
  },

  act1: {
    act: "act1",
    chapter: "第一幕 · 新郑雨夜",
    scene: "紫兰轩 · 内堂",
    beats: [
      { t: "narr", text: "烛火摇了摇。卫庄没有起身，也没有收手。他的手始终按在鲨齿上，像按着一头随时会醒的兽。" },
      { t: "dlg", who: "卫庄", text: "你不会武功。" },
      { t: "dlg", who: "韩非", text: "我不会。" },
      { t: "dlg", who: "卫庄", text: "你不会武功。夜幕的刀已在城头。一张嘴，救得了韩国？" },
      { t: "dlg", who: "韩非", text: "剑能杀人，不能替人想清楚为什么而死。这乱世最不缺拔剑的人，缺的是肯先把道理讲明白的人。" },
      { t: "narr", text: "卫庄看了他很久，终于缓缓松开了按剑的手。张良在一旁铺开竹简，上面是军饷失窃案密密麻麻的往来账目。" },
      { t: "dlg", who: "张良", text: "韩兄，军饷案再往下，就不止几个贪官了。是姬无夜，是夜幕，是边军。" },
      { t: "dlg", who: "韩非", text: "子房，怕吗？" },
      { t: "dlg", who: "张良", text: "怕。但我更怕查到一半，没人查了。" },
      { t: "dlg", who: "紫女", text: "夜幕的粮车，今夜会出东门。姬无夜以为雨大，没人会盯。" },
      { t: "dlg", who: "紫女", text: "皑皑血衣候，石上翡翠虎。碧海潮女妖，月下蓑衣客。姬无夜只是露在水面上的那块礁石。" },
      { t: "narr", text: "韩非自顾自提壶斟了杯酒，呷了一口，咂了咂嘴。" },
      { t: "dlg", who: "韩非", text: "紫女姑娘这酒，比韩国的朝局有劲多了。" },
      { t: "dlg", who: "紫女", text: "九公子若把品酒的心思分一半在正事上，韩国也不至于此。" },
      { t: "dlg", who: "韩非", text: "正因韩国至于此，才更要喝。喝醉了，才敢想那些清醒时不敢想的事。" },
      { t: "narr", text: "卫庄嗤了一声，张良却低下头，没让人看见他嘴角动了一下。" },
      { t: "narr", text: "三个人，三种武器：卫庄的剑，张良的笔，紫女的情报。他们都在等韩非落第一子。" },
      { t: "choice", choices: [
        {
          text: "卫庄兄，今夜便拔你的剑。截粮车，先让新郑看见流沙的牙。",
          note: "硬碰硬，先声夺人",
          addTags: ["以牙还牙"],
  effects: { dev: 2, trust: 8, korea: -5, mind: 2, zhuang: 3 },
          beats: [
            { t: "dlg", who: "卫庄", text: "好。我本以为你只会躲在紫兰轩里喝酒。" },
            { t: "dlg", who: "韩非", text: "酒要喝，剑也要拔。剑拔出来，总要见点血。" },
            { t: "dlg", who: "卫庄", text: "我只怕拔剑的人，不知道为什么拔。" },
            { t: "narr", text: "那一夜东门的火把亮到天明。粮车截下三辆，可天亮时，两名帮过流沙的暗桩被吊在城楼上。卫庄收剑时，雨水顺着剑脊往下淌。" },
            { t: "dlg", who: "卫庄", text: "看见没有。这就是你要的“先让人看见牙”。" },
            { t: "dlg", who: "韩非", text: "看见了。所以更要让人看清这口牙咬的是谁。" }
          ]
        },
        {
          text: "子房，账不要急着查完。顺着这条线，钓一条更大的鱼。",
          note: "以谋破局，长线落子",
          addTags: ["谋定后动"],
          effects: { trust: 5, mind: 5, zhang: 4 },
          beats: [
            { t: "dlg", who: "张良", text: "韩兄的意思是……放假消息？" },
            { t: "dlg", who: "韩非", text: "夜幕敢动军饷，是因为他们觉得没人敢往下查。我们偏要让他们以为查到了，又查错了。" },
            { t: "narr", text: "张良在卷宗前坐了一整夜。天将明时，他从一笔转运日期里，理出夜幕与边军往来的暗线。韩非把一杯温好的酒推过去。" },
            { t: "dlg", who: "韩非", text: "子房，你比我想的还稳。" },
            { t: "dlg", who: "张良", text: "（看着卷宗，轻声）韩兄这一笔，比卫庄兄的剑还狠。" },
            { t: "dlg", who: "韩非", text: "记住这句话。韩国若还有将来，这将来，多半要从你这支笔底下出来。" }
          ]
        },
        {
          text: "紫女姑娘，这酒还没喝完。消息，有时候是自己浮上来的。",
          note: "情报与人情，皆在酒里",
          addTags: ["情报为刃"],
          effects: { trust: 5, korea: 3, mind: 2, zinv: 4 },
          beats: [
            { t: "dlg", who: "紫女", text: "九公子是想让我去陪客人喝酒？" },
            { t: "dlg", who: "韩非", text: "是想陪我喝。顺便让隔壁那位西域马商，也“碰巧”听见我们聊南阳的铁料。" },
          { t: "narr", text: "紫女笑了，没有回答，只替他又斟了一杯。酒过三巡，那马商果然“无意”中提起夜幕在往南阳暗调铁料。" },
            { t: "dlg", who: "紫女", text: "紫兰轩这盏灯，照的是人心，比朝堂亮。" },
            { t: "dlg", who: "韩非", text: "冠带怕黑，所以要点烛火。人心不怕黑，所以才要你这盏灯。" },
            { t: "dlg", who: "紫女", text: "九公子有雄心。只是这世上，有雄心的失败者，从来不缺。" },
            { t: "dlg", who: "韩非", text: "亡国的罪名太重，我担不起。我只想在它亡之前，让几个人记得它也曾亮过灯。" }
          ]
        }
      ]},
      { t: "narr", text: "夜深了。紫女换了一盏新灯，灯火在韩非脸上投下暖色的影。" },
      { t: "dlg", who: "紫女", text: "九公子每次说“再来一杯”，都是在拖延天亮。" },
      { t: "dlg", who: "韩非", text: "紫女姑娘的灯，不也是？" },
      { t: "narr", text: "紫女没有回答。灯火轻轻摇了一下。" },
      { t: "narr", text: "天光从窗缝里漏进来时，四个人终于把话说到了一处。" },
      { t: "dlg", who: "韩非", text: "这组织，总要有个名字。" },
      { t: "dlg", who: "卫庄", text: "你想叫什么？" },
            { t: "dlg", who: "韩非", text: "有形的生命很脆弱。可无形的东西，能聚散，杀不死。就叫“流沙”。" },
      { t: "dlg", who: "紫女", text: "听着不吉利。" },
      { t: "dlg", who: "韩非", text: "乱世里，吉利的名字都活不长。" },
      { t: "narr", text: "没有人再反对。新郑的雨停了，可每个人都知道，这只是暴风雨前，最短的一阵安静。" }
    ],
    cta: "风起流沙",
    historyNote: {
      fact: "韩非归韩后未被重用，朝政长期被权臣与宗室贵戚把持；《史记》称他“悲廉直不容于邪枉之臣，观往者得失之变”，因而著书。韩国地处秦、楚、魏之间，在强秦连年攻伐下不断割地损兵，国势积弱难返。\n依据：《史记·老子韩非列传》《史记·韩世家》。",
      fiction: "韩非与卫庄、张良、紫女组建“流沙”以除弊图强、对抗“夜幕”等剧情，属动画设定；姬无夜其人亦为《秦时明月》系列虚构的韩国权臣，正史无载。"
    }
  },

  act2: {
    act: "act2",
    chapter: "第二幕 · 流沙初动",
    scene: "新郑 · 城楼",
    beats: [
      { t: "narr", text: "流沙动了半月，新郑的风向开始变。夜幕的暗桩被拔了三处，姬无夜发了狠，一夜之间，四个给流沙递过消息的小吏横尸街头。" },
      { t: "narr", text: "城楼上，卫庄把一枚染血的令牌扔在韩非面前。" },
            { t: "dlg", who: "卫庄", text: "你要的“让人看见牙”。这四个人看见了，现在他们看不见了。" },
      { t: "dlg", who: "韩非", text: "……我知道。" },
      { t: "dlg", who: "卫庄", text: "道理能让死人活过来？" },
      { t: "dlg", who: "韩非", text: "不能。可若因为怕死人便不动，死的人会更多。卫庄兄，我不是不知道疼。我是知道疼，才更要动。" },
      { t: "dlg", who: "卫庄", text: "弱者，没有资格要求公平。" },
      { t: "narr", text: "卫庄没有再说话。风把他的灰发吹乱，他别过脸去，像是不愿让韩非看见他眼里的东西。" },
      { t: "dlg", who: "张良", text: "韩兄，红莲公主又来了。在楼下，说要见你。" },
      { t: "narr", text: "韩非的眉头动了动。他这个妹妹，自小被宠大，偏偏在这种时候最不让人省心。" },
      { t: "dlg", who: "红莲", text: "哥！你又躲着我！卫庄都在这儿，凭什么不叫我？" },
      { t: "dlg", who: "韩非", text: "回去。" },
      { t: "dlg", who: "红莲", text: "我不！他一个外人都能替你卖命，我是你妹妹，反倒要被蒙在鼓里？我也会武功——" },
      { t: "dlg", who: "韩非", text: "红莲。" },
      { t: "narr", text: "韩非的声音不高，却让红莲把后半句咽了回去。她说话时眼睛一直往卫庄那边瞟，卫庄抱剑而立，像是没看见。" },
      { t: "choice", choices: [
        {
          text: "让卫庄带她去看一眼城楼下的尸身。有些事，怕过一次才懂。",
          note: "以剑说教，让她知险",
          addTags: ["知死方生"],
          effects: { trust: 5, korea: -3, mind: -2, zhuang: 2, honglian: 2 },
          beats: [
            { t: "dlg", who: "卫庄", text: "你确定？" },
            { t: "dlg", who: "韩非", text: "她总要知道，“加入”两个字是用血写的。" },
            { t: "narr", text: "红莲只看了一眼，就蹲在墙边吐了。卫庄抱剑站在一旁，没有嘲笑。" },
            { t: "dlg", who: "卫庄", text: "怕就回去。" },
            { t: "dlg", who: "红莲", text: "……我怕。可我更怕你们什么都不告诉我，把我锁起来。" },
            { t: "dlg", who: "韩非", text: "那就活着怕。活到你不再需要别人替你挡刀的那一天。" }
          ]
        },
        {
          text: "让子房连夜把她送出新郑，交给紫女。这局棋，不能把她卷进来。",
          note: "托付亲情，护她周全",
          addTags: ["亲不可殉"],
  effects: { dev: 2, trust: 4, mind: 3, zhang: 2, zinv: 2, honglian: 1 },
          beats: [
            { t: "dlg", who: "张良", text: "韩兄是要……" },
            { t: "dlg", who: "韩非", text: "送她去紫女那里。韩国要亡，也不差她一个公主陪葬。" },
            { t: "dlg", who: "红莲", text: "哥！你凭什么替我决定——" },
            { t: "dlg", who: "韩非", text: "就凭我是你哥。就凭这新郑城，迟早没有你我的容身之处。" },
            { t: "narr", text: "红莲的眼泪在眼眶里打转，终究没有落下来。她第一次发现，兄长嬉皮笑脸的背后，是这样一副她从不认识的肩膀。" },
            { t: "dlg", who: "紫女", text: "把她交给我吧。紫兰轩虽乱，却比这城头安全。" }
          ]
        },
        {
          text: "亲口告诉她：流沙没有公主，只有愿意留下的人。让她自己选。",
          note: "把选择权还给她",
          addTags: ["人各有择"],
  effects: { dev: 2, mind: 4, trust: 3, honglian: 4 },
          beats: [
            { t: "dlg", who: "韩非", text: "你听好。流沙里没有公主，也没有我韩非的妹妹。只有愿意留下、也可能死在这里的人。你还要加入吗？" },
            { t: "narr", text: "红莲怔住。良久，她用力抹了一把眼睛。" },
            { t: "dlg", who: "红莲", text: "……那我就不做公主。" },
            { t: "dlg", who: "韩非", text: "不做公主，你做什么？" },
            { t: "dlg", who: "红莲", text: "做红莲。" },
            { t: "dlg", who: "韩非", text: "好。可你记住，从今天起，你每走一步，都要自己担着。" },
            { t: "dlg", who: "卫庄", text: "倒是有几分骨气。" }
          ]
        }
      ]},
      { t: "narr", text: "红莲还站在原地。紫女走过来，没说话，只伸手把她握剑的姿势扶正了一点。" },
      { t: "dlg", who: "紫女", text: "剑不是这么握的。明天起，到紫兰轩来。" },
      { t: "narr", text: "红莲张了张嘴，终究没顶回去。她低头看着自己被扶正的手，那只手还在抖。" },
      { t: "narr", text: "红莲的事刚了，紫女的人匆匆上城，脸色比夜色还沉。" },
      { t: "dlg", who: "紫女", text: "秦使的车驾，已过函谷。三日后到新郑。" },
      { t: "dlg", who: "张良", text: "秦王……要的是什么？" },
      { t: "dlg", who: "紫女", text: "听说，是一个人。" },
      { t: "narr", text: "所有人的目光，都落在了韩非身上。他没有躲，只是望着西边压过来的黑云，极轻地笑了一下。" },
      { t: "dlg", who: "韩非", text: "该来的，总要来。" }
    ],
    cta: "秦使东来",
    historyNote: {
      fact: "秦王政即位后持续东出，三晋首当其冲。秦王政十三年（前234年）秦攻赵，平阳一战斩首十万；次年（前233年）韩非使秦。在此前后，韩国在秦的军事压力下已危如累卵，灭亡只是时间问题。\n依据：《史记·秦始皇本纪》《史记·韩世家》《史记·赵世家》。",
      fiction: "流沙“拔暗桩”、小吏横尸街头、卫庄与韩非在城楼以人命相诘等具体事件与对话，均为服务人物塑造的艺术虚构，史无其事。"
    }
  },

  act3: {
    act: "act3",
    chapter: "第三幕 · 秦使入韩",
    scene: "韩王宫 · 大殿",
    beats: [
      { t: "narr", text: "韩王宫的殿柱是新漆的，却遮不住一股子霉味。韩王安坐在王位上，像一件被摆错地方的旧器物。" },
      { t: "dlg", who: "秦使", text: "大王有命：韩国公子韩非，才名动于七国。请公子入秦一叙，大王扫席以待。" },
          { t: "narr", text: "满朝文武鸦雀无声。谁都听得懂“请”字后面的意思：你若不来，秦师便来。" },
      { t: "dlg", who: "韩王安", text: "非儿……你看，这……" },
      { t: "dlg", who: "韩非", text: "父王勿忧。儿臣愿往。" },
      { t: "dlg", who: "韩王安", text: "哎，好好好，还是我儿识大体——" },
      { t: "dlg", who: "韩非", text: "儿臣此去，不是替韩国谢恩。是替韩国，去看看那个要灭我们的人，长什么样。" },
      { t: "dlg", who: "韩非", text: "儿臣只有一事不明。" },
            { t: "dlg", who: "韩非", text: "韩国虽弱，尚有千里之地、数百年宗祀。咸阳一纸文书递到，满朝朱紫，竟无一人敢抬头看那秦使一眼。" },
      { t: "narr", text: "韩王安的脸涨成了猪肝色，却终究没有发作。韩非转身下殿，背影笔直得像一支将要离弦的箭。" },
      { t: "choice", choices: [
        {
          text: "回府路上，劫了秦使，据城死战！与其入秦受辱，不如玉石俱焚！",
          note: "以卵击石，逆天而行",
          addTags: ["势不可违"],
          effects: { dev: 20, mind: -8, korea: -10 },
          pullback: true,
          beats: [
            { t: "tag", text: "历史回拉" },
            { t: "narr", text: "韩非的手按在剑柄上。可他并不会武功。他几乎要召卫庄动手，那一点书生气在胸腔里烧得发烫。" },
            { t: "narr", text: "一只手按住了他的手腕。力道不重，却像铁铸的。是卫庄。" },
            { t: "dlg", who: "卫庄", text: "你不会武功。" },
            { t: "dlg", who: "韩非", text: "那也比跪着送人强！" },
            { t: "dlg", who: "卫庄", text: "刺下去，你死在一个小校手里。秦师早三日到新郑。" },
            { t: "narr", text: "韩非怔住。雨声忽然变得很远。他想起自己写下的话：势者，胜众之资也。以一城当天下，不是勇，是不知势。" },
            { t: "dlg", who: "卫庄", text: "真想让韩国记住你，就走进咸阳。" },
            { t: "dlg", who: "韩非", text: "……我若走不出来呢？" },
            { t: "dlg", who: "卫庄", text: "流沙不是你一个人的。" }
          ]
        },
        {
          text: "整衣冠，备车驾。我以韩国公子的身份，堂堂正正入秦。",
          note: "明知是局，仍要入局",
          addTags: ["以身入局"],
          effects: { mind: 6, korea: -2 },
          beats: [
            { t: "dlg", who: "张良", text: "韩兄，此去……" },
            { t: "dlg", who: "韩非", text: "子房，我若回不来，流沙交给你和卫庄。别学我。把聪明用在活下来上。" },
            { t: "dlg", who: "紫女", text: "紫兰轩的灯，不到天明不熄。" },
            { t: "dlg", who: "韩非", text: "留着吧。万一我夜里回来，还认得路。" },
            { t: "narr", text: "他说得轻巧，像只是去隔壁喝杯酒。可每个人都知道，这一去，隔着的是函谷关，是生死。" }
          ]
        },
        {
          text: "先去见红莲一面。把该交代的，都交代了再走。",
          note: "安顿亲情，再赴死局",
          addTags: ["临行托亲"],
          effects: { trust: 6, mind: 3, honglian: 3, zinv: 1, zhang: 1 },
          beats: [
            { t: "narr", text: "红莲正在院里练剑。韩非看了一眼她握剑的手，指节上有新磨的茧。卫庄在教她。" },
            { t: "dlg", who: "红莲", text: "哥？你怎么回来了……你要走了，是不是？" },
            { t: "dlg", who: "韩非", text: "嗯。" },
            { t: "dlg", who: "韩非", text: "卫庄教你的？" },
            { t: "dlg", who: "红莲", text: "嗯。他说我底子不差，就是剑太钝了。" },
            { t: "narr", text: "韩非笑了一下，没有接话。他知道卫庄从不夸人。" },
            { t: "dlg", who: "红莲", text: "我不让你走！我去求父王，我——" },
            { t: "dlg", who: "韩非", text: "红莲，看着我。" },
            { t: "narr", text: "他替妹妹理了理鬓发，动作轻得像怕碰碎什么。" },
            { t: "dlg", who: "韩非", text: "哥这一辈子，嬉皮笑脸，没正经过几回。这一回，你听哥一次，好好活着。韩国可以亡，你不能。" },
            { t: "dlg", who: "红莲", text: "……那你呢？" },
            { t: "dlg", who: "韩非", text: "我是韩国的公子。有些路，我不去走，就没人能替我走。" },
            { t: "narr", text: "红莲终于哭出了声。韩非没有再劝，只是站着，让她哭。" }
          ]
        }
      ]},
      { t: "narr", text: "车驾出新郑西门时，天又下起了雨。韩非掀帘回望，看见城头上站着三个人：灰发的，青衫的，紫衣的。" },
      { t: "dlg", who: "韩非", text: "（轻声）走罢。" },
      { t: "narr", text: "车轮碾过泥泞，西出函谷。身后是他救不下的国，身前是他走不出的城。" }
    ],
    cta: "西入函谷",
    historyNote: {
      fact: "秦王读到《孤愤》《五蠹》后慨叹：“嗟乎，寡人得见此人与之游，死不恨矣！”李斯告知此书为韩非所著，秦因此急攻韩。韩王起初不用韩非，待到情势危急，才派他出使秦国，时为秦王政十四年（前233年）。\n依据：《史记·老子韩非列传》《史记·秦始皇本纪》。",
      fiction: "秦使当廷威逼、韩非在大殿上斥责满朝无人敢言、韩王安怯懦推诿等场面，是在“及急，乃遣非使秦”这一史实骨架上所做的戏剧铺陈，对话与细节均为虚构。"
    }
  },
  act4: {
    act: "act4",
    chapter: "第四幕 · 咸阳辩法",
    scene: "咸阳宫",
    beats: [
      { t: "narr", text: "咸阳宫的灯火比新郑明亮，也比新郑冷。金砖玉柱之间，连回声都带着规矩。" },
      { t: "narr", text: "秦王嬴政比韩非想象中更年轻。他没有坐在王位上居高临下，而是走下玉阶，停在离韩非三步远的地方。" },
      { t: "dlg", who: "嬴政", text: "寡人读了先生的《孤愤》《五蠹》。" },
      { t: "dlg", who: "韩非", text: "大王读过便好。韩非此来，只怕不是与大王谈书的。" },
      { t: "dlg", who: "嬴政", text: "那便谈天下。先生还记得新郑那座破败庭院么？那夜先生说剑分三等。" },
      { t: "dlg", who: "韩非", text: "庶人之剑，行凶斗狠，招摇过市；诸侯之剑，以勇武为锋，清廉为锷，贤良为脊，忠圣为铗。" },
      { t: "dlg", who: "嬴政", text: "天子之剑，以七国为锋，山海为锷，制以五行，开以阴阳，持以春夏，行以秋冬，举世无双，天下归服。" },
      { t: "dlg", who: "韩非", text: "那夜大王说，欲铸一把天子之剑。" },
      { t: "dlg", who: "嬴政", text: "今夜寡人还是这句话。先生可愿替寡人铸它？" },
      { t: "dlg", who: "韩非", text: "大王读了非的书，读到的是剑，还是铸剑的人？" },
      { t: "dlg", who: "嬴政", text: "都读到了。寡人读《孤愤》，恨不能与先生同席而坐，彻夜长谈。寡人读《五蠹》，才知道这七国的天下，病在何处。" },
      { t: "narr", text: "他说这话时语气很平，像在陈述一件再明白不过的事。可满朝文武都听得出，这不是君王对臣下的赞许，是一个读过万卷书的人，终于遇见另一个读懂天下的人。" },
      { t: "dlg", who: "韩非", text: "非在韩国写了十年的书，韩王不曾翻过一页。大王远在咸阳，却逐字读了。" },
      { t: "dlg", who: "嬴政", text: "因为韩王要的是韩国的安稳，寡人要的是天下的将来。先生的书，是写给后者看的。" },
      { t: "dlg", who: "嬴政", text: "不登上悬崖，又怎么领略一览众山的绝顶风光。" },
      { t: "narr", text: "李斯在侧席坐着，目光复杂。他们曾同窗，如今一个是秦之重臣，一个是韩之质子。旧谊还在，只是旧谊之外，多了天下。" },
      { t: "choice", choices: [
        {
          text: "当庭直陈法术势，一天下者，不在仁义，在制度。",
          note: "以法会君，惺惺相惜",
          addTags: ["制度一天下"],
          effects: { mind: 6, trust: 3, lisi: 3 },
          beats: [
            { t: "dlg", who: "韩非", text: "天子之剑，铸它的不是铁。" },
            { t: "dlg", who: "嬴政", text: "说下去。" },
            { t: "dlg", who: "韩非", text: "法、术、势，三者合一。法者，编著于图籍；术者，藏之于胸中；势者，胜众之资也。有此三者，一天下如运诸掌。" },
            { t: "narr", text: "嬴政听完，竟许久没有说话。然后他做了一件满朝文武都没见过的事。他向韩非长揖一礼。" },
            { t: "dlg", who: "嬴政", text: "先生。可愿与寡人，同去开创这千古一国之梦？" },
            { t: "narr", text: "韩非在那一刻看清了：眼前这个人，是真懂他的人；也正因为懂，才绝不会放他回韩国。知己与敌手，原是同一张脸。" },
            { t: "dlg", who: "李斯", text: "（低声）师兄，你这一席话，既救了自己，也害死了自己。" }
          ]
        },
        {
          text: "我知苍龙七宿的秘密。大王若存韩退兵，我便献上。",
          note: "以秘辛换国运，铤而走险",
          addTags: ["秘辛是锁"],
          effects: { dev: 20, mind: -6, lisi: 1 },
          pullback: true,
          beats: [
            { t: "tag", text: "历史回拉" },
            { t: "dlg", who: "韩非", text: "大王可愿听一桩，能定天下气运的秘辛——" },
            { t: "narr", text: "他看见嬴政的眼睛亮了一下，像猎手听见远处的鹿鸣。可话到唇边，他忽然顿住了。" },
            { t: "narr", text: "一个能被秘密要挟的君王，不会是统一六国的君王；一个靠秘密续命的韩国，也早已不是韩国。苍龙七宿就算是真，也填不满秦国十年的积蓄，挡不住东出的秦师。" },
            { t: "dlg", who: "李斯", text: "师兄。" },
            { t: "narr", text: "李斯不知何时已走到他身侧，声音压得极低，却像一盆冷水。" },
            { t: "dlg", who: "李斯", text: "你可以用它换一夜安稳，换不来韩国一年。明日朝堂，你便是那个“以妖言惑君”的韩间。" },
            { t: "dlg", who: "韩非", text: "……你是在救我，还是在怕我？" },
            { t: "dlg", who: "李斯", text: "都有。你我同门一场，我不愿看你，死得难看。" },
            { t: "narr", text: "韩非闭上眼，把到了唇边的秘密咽了回去。再开口时，他只论法，不论秘。嬴政的目光从热切转为审视，又从审视，转为一丝不易察觉的敬意。" },
            { t: "narr", text: "他忽然想起自己在新郑冷宫深处读到的那些卷宗。七国王室世代守着同一个秘密，知道的人一个接一个暴毙。这秘密或许根本不是力量。它是一把锁，锁住每一个自以为能驾驭它的人。" }
          ]
        },
        {
          text: "借秦使之手，给卫庄捎一封短信。朝局，我来拖。",
          note: "未尽之约，托于故人",
          addTags: ["局未尽棋勿停"],
  effects: { dev: 5, trust: 10, zhuang: 4, mind: 2, lisi: 1 },
          beats: [
          { t: "narr", text: "韩非在袖中写了八个字：“局未尽，棋勿停。”送信的人要穿过函谷关，九死一生。" },
            { t: "dlg", who: "韩非", text: "告诉卫庄，咸阳的雨也一样冷。" },
            { t: "narr", text: "李斯看在眼里，却没有拦。" },
            { t: "dlg", who: "李斯", text: "你明知信送不到。" },
            { t: "dlg", who: "韩非", text: "送不送得到，是他的事。写不写，是我的事。" },
            { t: "dlg", who: "李斯", text: "……师兄，你总是这样。宁可把命押在人身上，也不肯押在势上。" }
          ]
        }
      ]},
      { t: "narr", text: "散朝时，嬴政独自叫住了他。" },
      { t: "dlg", who: "嬴政", text: "先生的法，寡人要用。先生的国，寡人要灭。" },
      { t: "narr", text: "韩非怔住。嬴政的语气里没有歉意，也没有得意，只有一种令人胆寒的坦然。" },
      { t: "dlg", who: "嬴政", text: "先生可以恨寡人。但千年之后，世人记得的是秦法，不是韩怨。" },
      { t: "dlg", who: "韩非", text: "……大王说得对。可韩非，是韩人。" },
      { t: "narr", text: "嬴政看了他很久，终于转过身去。" },
      { t: "dlg", who: "嬴政", text: "先生。" },
      { t: "narr", text: "韩非停住脚步。" },
      { t: "dlg", who: "嬴政", text: "寡人这一生杀过很多人，也还会杀更多。但从没有像今日这样，不想杀一个人。" },
      { t: "dlg", who: "韩非", text: "可大王还是会。" },
      { t: "dlg", who: "嬴政", text: "因为先生是韩非。先生的法能一天下，先生的人却只会为韩。这两样寡人都留不住，也都放不下。" },
      { t: "narr", text: "他没有回头。韩非也没有再说话。两个当世最聪明的人在咸阳宫的长廊上站了片刻，像两把终于相交的剑，都在对方身上看见了自己的影子。" },
      { t: "dlg", who: "嬴政", text: "……下去吧。" },
      { t: "narr", text: "那一夜，韩非没有回驿馆。来“请”他的人里，为首的是李斯。他没有穿官服，只着了一件素色深衣。" },
      { t: "dlg", who: "李斯", text: "师兄，对不住。" },
      { t: "dlg", who: "韩非", text: "不必。你我各为其国，各走其道。今日你不送我，明日也会有别人。" },
      { t: "narr", text: "李斯嘴唇动了动，终究什么也没再说。他侧身让开一条路，却始终不敢看韩非的眼睛。" },
      { t: "narr", text: "牢门合拢的声音，在幽深的狱道里传了很远。" },
    ],
    cta: "云阳狱冷",
    historyNote: {
      fact: "韩非入秦后上书秦王，即传世的《韩非子·存韩》篇，主张保留韩国、移兵伐赵；李斯随即上《上秦王书》逐条驳斥，姚贾亦主灭韩。政见之争加上李斯、姚贾的忌惮，成为日后韩非被谗下吏的直接根源。\n依据：《韩非子·存韩》及所附李斯《上秦王书》、《史记·老子韩非列传》。",
      fiction: "秦王下阶相迎、当庭论“法术势”、李斯席间的复杂心态等场景与对白均为虚构；正史未载秦王与韩非会面交谈的具体情形。"
    }
  },

  act5: {
    act: "act5",
    chapter: "第五幕 · 云阳狱",
    scene: "云阳狱 · 死牢",
    beats: [
      { t: "narr", text: "云阳狱的墙，是渗出水的。湿气顺着脊背往上爬，像有无数只手，要把人往地里拽。" },
      { t: "narr", text: "案上摆着李斯送来的药。韩非捂住右臂，那里有一团淡黑色的纹路，像被烫伤后留下的疤痕，却会像心脏一样跳动。他不知道那是什么——只是身体一天天差下去，仿佛有什么东西从骨子里往外噬。" },
      { t: "dlg", who: "李斯", text: "药……是我送的。你身上的咒，不是我下的。师兄，这两件事，你要分清楚。" },
            { t: "dlg", who: "韩非", text: "咒？我还以为是毒。不过也罢——你送药，是尽同门义；人家下咒，你装作不知道，是尽人臣之忠。你看，你我都活到了把“义”和“忠”拆开来做的地步。" },
      { t: "narr", text: "韩非的目光落在身侧那把残破的古剑上。逆鳞。剑身碎成数段，剑柄上的凶兽图案在暗光里像闭着眼。" },
      { t: "narr", text: "他伸手握住剑柄。没有阴气涌起，没有时空凝滞，没有那个青黑色的身影替他挡下这一切。剑灵沉睡着，或者说它不再应答。" },
      { t: "dlg", who: "韩非", text: "……你也觉得，不必了。" },
      { t: "narr", text: "他终于明白那是什么了——不是毒，不是病，是阴阳家的咒。李斯叫它“咒”的时候，他还不信，可那团纹路跳动的节奏越来越快，体内像有什么东西在撕扯，一阵烫过一阵。他想起在新郑时听人说过，阴阳家有一种禁咒，叫六魂恐咒，必须贴身接触才能下成，潜伏在血脉里不立刻发作，发作时无药可解。他不知道是什么时候被人下的——也许是某一次握手，也许是某一杯酒，也许更早。那个人贴得那么近，近到他压根没想到要防。" },
      { t: "narr", text: "剑灵挡得住敌人，挡不住自己。更挡不住一个人最终选择不逃。" },
      { t: "narr", text: "李斯沉默了一会儿。狱外的风穿过甬道，带着一种不属于秦国的、极淡的檀香味。" },
      { t: "dlg", who: "李斯", text: "咒从何来，我不知。我只知道，你碰了苍龙七宿，就有人不希望你活着走出秦国。那人不在咸阳宫里。" },
      { t: "dlg", who: "韩非", text: "……我知道。" },
      { t: "narr", text: "长久的沉默。李斯站起身，在牢门前停了一步。" },
      { t: "dlg", who: "李斯", text: "……师兄的文章，斯读了二十年。" },
      { t: "dlg", who: "韩非", text: "然后你亲手送它的作者上路。" },
      { t: "narr", text: "李斯没有回头。" },
      { t: "dlg", who: "李斯", text: "……你可有话，要我带出去？" },
      { t: "narr", text: "韩非没有立刻回答。他借着窗缝里那一线天光，把该写的字、该托的话，在心里又过了一遍。" },
      { t: "narr", text: "韩国的雨，咸阳的月，紫兰轩的灯，兰陵的书。这些画面竟没有乱，反而前所未有地清楚。" },
      { t: "narr", text: "他还想起那夜对那个白衣公子说过的话：我曾经穿过岁月长河，看到过自己的死亡。那时嬴政不信。现在，他自己信了。" },
      { t: "narr", text: "他想起在新郑那座破败庭院里，自己曾对一个白衣公子说过的话：十年可见春去秋来，百年可证生老病死，千年可叹王朝更替，万年可见斗转星移。那时他说的是天地，临了才懂，说的也是生死。" },
      { t: "narr", text: "他想起紫女说过，紫兰轩的灯不到天明不熄。不知那盏灯，现在还亮不亮。" },
      { t: "dlg", who: "韩非", text: "我要留的，不留给你。你替我，把人叫来。" },
      { t: "narr", text: "李斯走后，牢里只剩水声。韩非静坐片刻，把要交代的人在心里排了一遍。" },
      { t: "narr", cond: { mindMin: 60 }, text: "他撑着墙站起来，把囚衣上的褶皱一一抚平，又将案上散着的竹简理齐。手在抖，他看了一眼，用左手按住右手。" },
      { t: "dlg", who: "韩非", cond: { mindMin: 60 }, text: "字还能写。话还能留。" },
      { t: "narr", cond: { mindMin: 60 }, text: "他坐直了。窗外的一线天光落在他肩上，像一柄没有重量的剑。" },
      { t: "narr", cond: { mindMax: 49 }, text: "他没有动。咒纹在皮肤下游走，像一条活物，每跳一下就带走一分力气。他看着案上那杯冷酒，伸手去拿，杯子碰在齿间，发出轻响。" },
      { t: "dlg", who: "韩非", cond: { mindMax: 49 }, text: "……做了这么多，还是走到了这里。" },
      { t: "narr", cond: { mindMax: 49 }, text: "他闭上眼。新郑的雨声远了，紫兰轩的灯远了，连那个人按住他手腕的力道也远了。可他还是睁开了眼。因为该说的话，还没有说完。" },
      { t: "choice", choices: [
        {
          text: "给子房写一封长信，写法、术、势与没说完的话。",
          note: "托付理想，留于后人",
          effects: { zhang: 5 },
          final: "zhang",
          beats: [
            { t: "narr", text: "他向狱卒讨来竹简和笔。云阳狱的竹简又黄又脆，笔也是秃的。可他写得很慢，一笔一画，像在紫兰轩铺开一张干净的绢。" },
            { t: "narr", text: "他不知道这卷竹简能不能送出函谷关。也许会被李斯扣下，也许会在半路散佚，也许永远到不了张良手里。可他还是写。" },
            { t: "dlg", who: "韩非", text: "（落笔）子房，你聪颖过我，所欠者唯阅历耳。我这卷书，这条路，今日交到你手上。" },
            { t: "narr", text: "他想象那个青衫少年读到这句话时的模样。会皱眉，会沉默，会把竹简合上又打开。最后低声说一句：韩兄，良担不起。" },
            { t: "dlg", who: "韩非", text: "担不起也要担。人死了，道不能死。别学我，把聪明用在活下来上，活到能看见天下一统的那一天。" },
            { t: "narr", text: "最后一笔落下时，天光正从窗缝里移走。他把竹简卷好，用那根系发的紫色丝绦束住，放在案头最显眼的位置。" }
          ]
        },
        {
          text: "托人给卫庄带句话：那盘棋，我先落了一子。",
          note: "未尽之约，托于知己",
  effects: { dev: 5, zhuang: 5 },
          final: "zhuang",
          beats: [
            { t: "narr", text: "卫庄不可能来咸阳。来的是紫兰轩一个不起眼的老仆，战战兢兢地跪在牢门外。" },
            { t: "dlg", who: "韩非", text: "你回去告诉卫庄，那盘棋，我先落了一子。" },
            { t: "dlg", who: "老仆", text: "就……就这一句？" },
            { t: "dlg", who: "韩非", text: "他听得懂。" },
            { t: "narr", text: "老仆走后，韩非靠着墙笑了。他几乎能想象卫庄听到这句话时的神情。不会哭，不会怒，只会把鲨齿往鞘里再送一寸，然后在往后的很多年里，一直查下去。" },
            { t: "dlg", who: "韩非", text: "（轻声）卫庄……这一局，是我先你一步。剩下的，你替我看着。" }
          ]
        },
        {
          text: "谁也不见。独自斟完那杯冷酒，把该说的话都咽下去。",
          note: "孤灯独灭，不言而去",
          effects: { mind: -5 },
          final: "alone",
          beats: [
            { t: "narr", text: "他遣走了所有人。牢里只剩他一个，和案上那杯早已凉透的酒。" },
            { t: "dlg", who: "韩非", text: "……说了一辈子，临了，反倒没什么可说的。" },
            { t: "narr", text: "他举起杯，对着窗缝里那一线天光，遥遥一敬，敬新郑的雨，敬紫兰轩的灯，敬那三个还站在城头上的人。" },
            { t: "dlg", who: "韩非", text: "（举杯）这杯，我先饮。诸位——慢些来。" },
            { t: "narr", text: "酒入喉，是冷的。他这一生讲了太多道理，最后一句话，却没有留给任何人。" }
          ]
        }
      ]},
      { t: "narr", text: "天光一点点暗下去。韩非靠在墙上，听见自己的心跳，一声，比一声远。" },
      { t: "narr", text: "他没有等到秦王的赦令。其实他早知道，嬴政会后悔，只是那份后悔，永远会晚一步。" },
      { t: "narr", text: "赦令到达云阳时，天刚亮。内侍捧着王符一路跑进狱道，只看见一盏燃尽的油灯，和案上一只空了的酒盏。" },
      { t: "narr", text: "消息传回咸阳宫时，嬴政正在读一卷竹简。那是韩非入秦后呈上的《存韩》。他听完禀报，没有说话，只是把那卷竹简慢慢合上，放在案头最醒目的位置。" },
      { t: "dlg", who: "嬴政", text: "寡人得见此人与之游，死不恨矣。" },
      { t: "narr", text: "他低声重复了一遍当年读到《孤愤》《五蠹》时说过的话。只是这一次，「得见」已成永别，「死不恨矣」四个字，听上去竟像是说给自己听的。" },
      { t: "narr", text: "后来嬴政用了十年一统天下，车同轨，书同文，以法为教，以吏为师。他用的是韩非的法，走的是韩非论过的路。只是那条路的尽头，再也没有一个能与他对坐论天下的人了。" },
      { t: "narr", text: "这，就是他选的结局。" },
      { t: "narr", text: "水面的涟漪虽然暂时消散了，但仍会有人记得，风曾经吹过。" },
    ],
    cta: "结局已定",
    historyNote: {
      fact: "李斯、姚贾进谗，称“韩非，韩之诸公子也，今王欲并诸侯，非终为韩不为秦”，劝秦王“以过法诛之”。秦王以为然，将韩非下吏治罪。李斯派人送毒药令其自杀，韩非想面见秦王申辩而不得；秦王后来后悔，派人赦免，韩非已死。《秦始皇本纪》系年于秦王政十四年（前233年），并明言“非死云阳”。\n身后：秦王政十七年（前230年），秦内史腾攻韩，俘韩王安，以其地置颍川郡，韩亡；二十六年（前221年），秦灭六国，一统天下。\n依据：《史记·老子韩非列传》《史记·秦始皇本纪》《史记·韩世家》。",
      fiction: "云阳狱中的同门对话、六魂恐咒与阴阳家、逆鳞剑灵、“药乃李斯所送而咒非其所下”等情节，均为《秦时明月/天行九歌》的虚构设定。“云阳狱”之称系由《史记》“死云阳”敷衍而来；正史只载韩非被留、自杀，具体死状与细节多为后世及本游戏的艺术补全。红莲（赤练）、卫庄等人的后续亦属粉丝向演绎，非正史。"
    }
  }
};

/* ==================== 引擎 ==================== */

const $ = (id) => document.getElementById(id);
const clamp = (v, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, v));

let queue = [];
let typingTimer = null;
let typingFull = "";
let typingDone = true;

function applyEffects(effects) {
  if (!effects) return;
  for (const [k, v] of Object.entries(effects)) {
    if (k in state) state[k] = (state[k] || 0) + v;
  }
  state.trust = clamp(state.trust);
  state.korea = clamp(state.korea);
  state.mind = clamp(state.mind);
  state.dev = clamp(state.dev);
}

function renderStatus() {
  [["trust","bar-trust","val-trust"],["korea","bar-korea","val-korea"],
   ["mind","bar-mind","val-mind"],["dev","bar-dev","val-dev"]].forEach(([k,b,v])=>{
    $(b).style.width = state[k] + "%";
    $(v).textContent = state[k];
  });
  renderTags();
}

function renderTags() {
  const el = $("tag-row");
  if (!el) return;
  el.innerHTML = state.tags.map(t => `<span class="tag-chip">${escapeHtml(t)}</span>`).join("");
}

const TOAST_COLORS = {
  trust: "positive", korea: "negative", mind: "positive", dev: "dev",
  zhuang: "positive", zhang: "positive", zinv: "positive", honglian: "positive", lisi: "positive"
};

function showEffectToasts(effects) {
  const container = $("effect-toasts");
  if (!container) return;
  let delay = 0;
  for (const [k, v] of Object.entries(effects)) {
    if (!(k in EFFECT_LABELS)) continue;
    setTimeout(() => {
      const toast = document.createElement("div");
      const cls = TOAST_COLORS[k] || (v > 0 ? "positive" : "negative");
      toast.className = `effect-toast ${cls}`;
      const sign = v > 0 ? "+" : "";
      toast.textContent = `${sign}${v} ${EFFECT_LABELS[k]}`;
      container.appendChild(toast);
      setTimeout(() => toast.remove(), 2000);
    }, delay);
    delay += 120;
  }
}

function setAtmosphere(act) {
  document.body.setAttribute("data-act", act || "prologue");
}

const SCENE_ART = {
  start: "assets/scene-prologue.jpg",
  act1: "assets/scene-zilanxuan.jpg",
  act2: "assets/scene-tower.jpg",
  act3: "assets/scene-hall.jpg",
  act4: "assets/scene-xianyang.jpg",
  act5: "assets/scene-prison.jpg"
};

function setSceneArt(ch) {
  const img = $("scene-img");
  const place = $("scene-place");
  const src = SCENE_ART[ch.id] || ch.art;
  place.textContent = ch.scene || "";
  if (!src) { img.removeAttribute("src"); img.classList.remove("loaded"); return; }
  img.classList.remove("loaded");
  const tmp = new Image();
  tmp.onload = () => {
    img.src = src;
    requestAnimationFrame(() => img.classList.add("loaded"));
  };
  tmp.src = src;
}
function startChapter(id) {
  const ch = STORY[id];
  if (!ch) return;
  ch.id = id;
  setAtmosphere(ch.act);
  if (id === "act5") {
    const prisonEffects = { mind: -8 };
    showEffectToasts(prisonEffects);
    applyEffects(prisonEffects);
  }
  const panel = document.querySelector(".status-panel");
  if (id === "start") { panel.classList.remove("revealed"); } else { panel.classList.add("revealed"); }
  $("chapter-label").textContent = ch.chapter || "";
  setSceneArt(ch);
  queue = [...ch.beats];
  renderStatus();
  nextBeat();
}

function escapeHtml(s){
  return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}

let epigraphReady = false;
function showEpigraph(text) {
  const overlay = $("epigraph-overlay");
  const content = $("epigraph-content");
  const lines = text.split("\n");
  const totalDelay = (lines.length - 1) * 0.5 + 1.4;
  content.innerHTML = lines.map((ln, i) =>
    `<span class="epigraph-line" style="animation-delay:${i * 0.5}s">${escapeHtml(ln)}</span>`
  ).join("") + `<span class="epigraph-hint" style="animation-delay:${totalDelay}s">${"\u70b9\u51fb\u7ee7\u7eed"}</span>`;
  overlay.classList.remove("fade-out");
  overlay.hidden = false;
  epigraphReady = false;
  setTimeout(() => { epigraphReady = true; }, totalDelay * 1000);
}
function dismissEpigraph(cb) {
  const overlay = $("epigraph-overlay");
  if (!epigraphReady) {
    const lines = overlay.querySelectorAll(".epigraph-line, .epigraph-hint");
    lines.forEach(el => { el.style.animationDuration = "0.3s"; el.style.animationDelay = "0s"; });
    epigraphReady = true;
  }
  overlay.classList.add("fade-out");
  setTimeout(() => {
    overlay.hidden = true;
    overlay.classList.remove("fade-out");
    cb();
  }, 1000);
}

function showText(beat) {
  const box = $("textbox");
  box.hidden = false;
  box.classList.toggle("pullback", beat._pullback);
  const speakerEl = $("speaker");
  const textEl = $("text");
  const portraitEl = $("portrait");
  textEl.className = "text" + (beat.t === "narr" ? " narr" : "");
  $("next-hint").style.visibility = "visible";

  if (beat.t === "tag") {
    speakerEl.removeAttribute("data-tone");
    speakerEl.textContent = "";
    textEl.innerHTML = `<span class="pullback-tag">${escapeHtml(beat.text)}</span>`;
    portraitEl.hidden = true;
    typingDone = true;
    return;
  }

  if (beat.t === "epigraph") {
    box.hidden = true;
    showEpigraph(beat.text);
    typingDone = true;
    return;
  }

  if (beat.who && PORTRAITS[beat.who]) {
    speakerEl.textContent = beat.who;
    speakerEl.setAttribute("data-tone", TONE[beat.who] || "");
    portraitEl.src = PORTRAITS[beat.who];
    portraitEl.hidden = false;
  } else {
    speakerEl.textContent = beat.who || "";
    if (beat.who) speakerEl.setAttribute("data-tone", TONE[beat.who] || "");
    else speakerEl.removeAttribute("data-tone");
    portraitEl.hidden = true;
  }
  typewrite(textEl, beat.text);
}

function typewrite(el, text) {
  typingFull = text;
  typingDone = false;
  el.textContent = "";
  clearInterval(typingTimer);
  let i = 0;
  typingTimer = setInterval(() => {
    if (i >= text.length) {
      clearInterval(typingTimer);
      typingDone = true;
      return;
    }
    el.textContent += text[i++];
  }, 28);
}

function finishTyping() {
  if (typingDone) return;
  clearInterval(typingTimer);
  $("text").textContent = typingFull;
  typingDone = true;
}

function checkCond(cond) {
  if (!cond) return true;
  for (const [rule, target] of Object.entries(cond)) {
    if (rule.endsWith("Min")) {
      const key = rule.slice(0, -3);
      if ((state[key] ?? 0) < target) return false;
    } else if (rule.endsWith("Max")) {
      const key = rule.slice(0, -3);
      if ((state[key] ?? 0) > target) return false;
    }
  }
  return true;
}

function nextBeat() {
  $("choices").innerHTML = "";
  if (queue.length === 0) { // end of chapter
    showChapterEnd();
    return;
  }
  let beat = queue.shift();
  while (beat && beat.cond && !checkCond(beat.cond)) { beat = queue.length ? queue.shift() : null; }
  if (!beat) { showChapterEnd(); return; }
  if (beat.t === "choice") {
    showChoices(beat.choices);
    return;
  }
  showText(beat);
}

function showChoices(choices) {
  $("textbox").hidden = true;
  const el = $("choices");
  el.innerHTML = "";
  choices.forEach((c, i) => {
    const btn = document.createElement("button");
    btn.className = "choice-btn" + (c.pullback ? " danger" : "");
    btn.type = "button";
    const note = c.note ? `<span class="choice-note">${escapeHtml(c.note)}</span>` : "";
    btn.innerHTML = `<span class="choice-key">${String.fromCharCode(65+i)}.</span>${escapeHtml(c.text)}${note}`;
    btn.addEventListener("click", () => choose(c));
    el.appendChild(btn);
  });
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

function choose(c) {
  if (c.effects) showEffectToasts(c.effects);
  applyEffects(c.effects);
  renderStatus();
  if (c.final) state.final = c.final;
  if (c.addTags) {
    for (const tag of c.addTags) {
      if (!state.tags.includes(tag)) state.tags.push(tag);
    }
    renderTags();
  }
  if (c.beats && c.beats.length) {
    const tagged = c.pullback
      ? c.beats.map(b => ({...b, _pullback: true}))
      : c.beats;
    queue = [...tagged, ...queue];
  }
  nextBeat();
}

/* 章节推进顺序 */
const ORDER = ["start","act1","act2","act3","act4","act5"];
let chapterIdx = 0;

const ACT_END_LABEL = {
  prologue: "序章终", act1: "第一幕终", act2: "第二幕终",
  act3: "第三幕终", act4: "第四幕终", act5: "第五幕终"
};

function showChapterEnd() {
  const id = ORDER[chapterIdx];
  const ch = STORY[id];
  const isLast = chapterIdx === ORDER.length - 1;
  $("textbox").hidden = false;
  $("textbox").classList.remove("pullback");
  $("speaker").textContent = "";
  $("portrait").hidden = true;
  $("next-hint").style.visibility = "hidden";
  const el = $("choices");
  el.innerHTML = "";

  if (isLast) {
    $("text").className = "text narr";
    $("text").innerHTML = `<span class="hl">五幕已尽。</span>你的选择，将决定韩非以何种方式走入那一夜。`;
    const btn = document.createElement("button");
    btn.className = "primary-btn";
    btn.type = "button";
    btn.textContent = "见结局 →";
    btn.addEventListener("click", () => showEnding());
    el.appendChild(btn);
  } else {
    const nextCh = STORY[ORDER[chapterIdx + 1]];
    const endLabel = ACT_END_LABEL[ch.act] || "本章终";
    $("text").className = "text intertitle";
    $("text").innerHTML =
      `<span class="intertitle-tag">${endLabel}</span>` +
      `<span class="intertitle-cta">${escapeHtml(ch.cta || "继续")}</span>`;
    const btn = document.createElement("button");
    btn.className = "primary-btn";
    btn.type = "button";
    btn.textContent = `${nextCh.chapter} →`;
    btn.addEventListener("click", () => {
      chapterIdx++;
      startChapter(ORDER[chapterIdx]);
    });
    el.appendChild(btn);
  }
  window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
}

/* 结局 */
function decideEnding() {
  if (state.dev >= 20) return "regret";
  if (state.final === "zhang" && state.zhang >= 5) return "legacy";
  if (state.final === "zhuang" && (state.zhuang >= 6 || state.trust >= 50)) return "kindred";
  return "lonely";
}

const ENDINGS = {
  lonely: { eyebrow: "结局 · 其一", title: "孤灯",
    body: ["云阳狱的灯熬到了油尽。没有人收到他的信，也没有人听见他最后那句话。","韩非伏在案上，手边是一卷没写完的《孤愤》。窗外的月亮很白，像新郑多年前的那一场雨。","他这一生，看清了天下的病，却没能救活自己的国；留住了法与道，却没留住一个能在临终前答话的人。","数日后，秦王的赦令到达云阳，只来得及看见一盏熄灭的灯。","他曾说要七国的九十九。可他最后拥有的，只有云阳狱里一盏将尽的灯。"],
    epilogue: ["多年以后，流沙还在。","紫兰轩的灯灭了，没有人再见过那个紫衣的女子。多年后，一个红衣少女立在卫庄身侧，腰间缠着一柄赤红如练的软剑。没有人问过那剑从何而来，也没有人再叫过她的公主封号。她的眼神早已不是当年的模样。","新郑的雨还在下。卫庄找过那个紫衣女子，没有找到。他没有再找第二次。","只是雨里再也没有那个举杯笑谈天下的公子。那把名为逆鳞的残破古剑，也随它的主人一起，不知所踪。"] },
  kindred: { eyebrow: "结局 · 其二", title: "知己",
    body: ["卫庄收到那句话时，正在韩国边境的雨里。他没有回话，只是把鲨齿往鞘里又送了一寸。","——那盘棋，你先落了一子。","多年以后，流沙的名头在七国间令人闻风丧胆。有人说卫庄成了杀手，有人说他投了秦，只有他自己知道，他一直在查一件旧事：那个在新郑雨里跟他说要争一争天下的人，究竟是怎么死在云阳狱里的。那杯毒酒是谁送的，他知道。可那道咒纹从何而来，他要查的是比秦廷更深的地方。","韩非死了，可他落下的那一子，卫庄替他守着。这不是复国，复国早已无望；这是一个人对另一个人的承诺。你没走完的局，我替你看着。","他曾说要七国的九十九。那九十九他没有拿到，只落下了一子。可那一子，有人替他守着。"],
    epilogue: ["咸阳。","鲨齿的齿尖抵在李斯的喉头。卫庄的声音没有起伏：“韩非是中六魂恐咒而死的。从问题的源头，替我查。”","李斯没有回答。因为他也不知道，那个懂六魂恐咒的人，究竟藏在多深的地方。","咸阳宫的风很冷。像很多年前，新郑的雨。"] },
  legacy: { eyebrow: "结局 · 其三", title: "子房",
    body: ["张良展开那封长信时，指节是抖的。信上没有眼泪，只有一笔一画的法、术、势，和一句写在末尾的话：","——“子房聪颖过我，所欠者唯阅历耳。此道孤且险，然天下终需有人行之。”","很多年后，张良站在博浪沙的力士身侧，又站在灞上的军帐之中，再后来，他站在留县的封地前，自称“留侯”。","他没有活成韩非。他比韩非走得更远，也更懂得藏。可每当他做出一个艰难的决定，总会想起新郑雨里那个漫不经心的公子。那人没看到天下一统，却把如何看待天下的眼睛，留给了他。","他曾说要七国的九十九。子房后来才懂，他要的从来不是九十九本身，而是有人在他死后，把这局棋看完。"],
    epilogue: ["桑海，小圣贤庄。","张良已成了儒家三当家，青衫依旧，只是眉宇间多了几分当年在新郑雨里不曾有的沉。","某日城墙上，他与卫庄重逢。两人没有寒暄。张良说：“李斯向我打听过韩非，也打听过苍龙七宿。”卫庄没有接话，只把鲨齿往鞘中送了一寸。","那一刻张良终于明白，韩非留给他的从来不是一卷书。是一条很长、很孤独，却必须有人走下去的路。"] },
  regret: { eyebrow: "结局 · 其四", title: "余恨",
    body: ["韩非太想赢了。他想以一城当秦，想以秘辛换国运，一次又一次把手伸向那道本不该由他推动的车轮。","可车轮没有停。他越是用力，越看清自己的无力。韩国的病不在姬无夜，在积弊百年；秦国的胜不在白起王翦，在制度耕战。这些他都懂，却在临死前才真正放下。","云阳狱的最后一夜，他心里烧着一团没处使的火。他恨自己看得太清，又恨自己做得太少；恨韩国不争，也恨这天下不给韩国争的机会。","但恨归恨，史笔不改。韩非死在秦国，韩国亡于内史腾之手，秦王终于一统六国。他的余恨，和他的法一起，留在了那卷没有写完的书里。","他太想赢那九十九了。可九十九从来不是一个人能赢的。"],
    epilogue: ["韩非死后，流沙变了。","它不再是新郑雨夜里四个年轻人想要建立一个新韩国的理想，而成了七国闻风丧胆的杀手组织。卫庄再没提过韩非的名字，却把调查他的死因，变成了往后余生唯一没有放弃的事。","他查到秦宫，查到阴阳家，查到那个连秦王都未必触及的深处。","那盘棋还没下完。只是落下第一子的人，再也看不到终局了。"] }
};

function getMindVariants(endingKey, mind) {
  const paragraphs = [];
  if (mind >= 55) {
    if (endingKey === "lonely") paragraphs.push("灯油将尽时，韩非把背挺直了些。他将没写完的竹简卷起压在案角，又把灯芯拨亮，像还在等一个不会来的故人。");
    if (endingKey === "kindred") paragraphs.push("他把那句话送出时，心里竟有一点轻松。不是相信卫庄能改天命，而是知道自己不必独自把这局棋扛到终盘。");
    if (endingKey === "legacy") paragraphs.push("他说到最后，声音反而稳了。那些法、术、势不再是救命的稻草，而是他亲手交给后来者的火种。");
    if (endingKey === "regret") paragraphs.push("他恨，却没有求饶。到最后，他仍把那句没说完的话咽了回去，只在案上留下一道被指甲刻出的痕。");
  } else if (mind <= 44) {
    if (endingKey === "lonely") paragraphs.push("冷酒入喉时，他或许有过一丝悔。可那点悔意很快被胸口的咒纹压下去，连一声叹息都没有留给人间。");
    if (endingKey === "kindred") paragraphs.push("那句话送出后，他并没有觉得轻松。他知道卫庄会查下去，也知道自己终究把一副太重的担子，留给了活人。");
    if (endingKey === "legacy") paragraphs.push("他尽量把话说得稳，可有些字句仍轻得像灰烬。张良记住了道理，也记住了那灰烬后面没说出口的疲倦。");
    if (endingKey === "regret") paragraphs.push("那团火渐渐冷下去。他忽然明白，自己恨的不只是秦，不只是韩，而是一个人看清结局，却仍要走到结局的无力。");
  } else if (endingKey === "lonely") {
    paragraphs.push("他忽然觉得累。不是身体的累，是一个人把七国天下都在心里称过一遍后的空。");
  }
  return paragraphs;
}

function getVariantEpilogues(endingKey, mind) {
  const extras = [];
  if (state.zinv >= 8 && endingKey === "lonely") {
    extras.push("紫兰轩的灯没有灭。在韩非死后的很多年里，那盏灯总在雨夜亮着，只是再也没有人见过点灯的人。");
  }
  if (state.honglian >= 6 && (endingKey === "lonely" || endingKey === "kindred")) {
    extras.push("红莲没有哭。她把那柄赤练剑缠在腰间，从此再没有人叫过她的公主封号。");
  }
  if (state.trust >= 35 && mind >= 45 && endingKey !== "regret") {
    extras.push("流沙的人没有散。他们记得新郑雨里那个公子说过的话，也记得他没说完的话。");
  }
  if (state.zhuang >= 10 && mind >= 45 && endingKey === "kindred") {
    extras.push("卫庄把鲨齿挂回墙上时，动作很轻。那是他唯一一次，没有让剑发出声响。");
  }
  if (state.zhang >= 10 && mind >= 45 && endingKey === "legacy") {
    extras.push("张良把那封长信读了很多遍。读到最后，纸上的字都磨毛了边。他没有烧，也没有示人，只是收进了袖中。");
  }
  if (state.lisi >= 3 && endingKey !== "regret") {
    extras.push("李斯送来的毒酒用的是一只素白的酒樽，不是狱卒常用的粗陶碗。他没有留话。韩非看着那只酒樽看了很久，终究没有说什么。");
  } else if (state.lisi <= 1 && endingKey === "lonely") {
    extras.push("赐死的诏书写得公事公办，墨痕未干。李斯的名字签在末尾，笔画稳得像在批一份寻常的卷宗。");
  }
  return extras;
}

function renderRecap() {
  const grid = $("recap-grid");
  const section = $("ending-recap");
  const items = [
    { label: "卫庄", key: "zhuang", color: "#8a9bb0" },
    { label: "张良", key: "zhang", color: "#7fa088" },
    { label: "紫女", key: "zinv", color: "#a08ab0" },
    { label: "红莲", key: "honglian", color: "#c47a7a" }
  ];
  grid.innerHTML = items.map(item => {
    const val = state[item.key] || 0;
    return `<div class="recap-item">` +
      `<span class="recap-label">${item.label}</span>` +
      `<div class="recap-bar"><div class="recap-fill" style="width:${Math.min(val,15)/15*100}%;background:${item.color}"></div></div>` +
      `<span class="recap-val">${val}</span></div>`;
  }).join("");
  section.hidden = false;
}

function getGallery() {
  try { return JSON.parse(localStorage.getItem("hanfei_endings") || "[]"); }
  catch(e) { return []; }
}
function saveGallery(key) {
  const seen = getGallery();
  if (!seen.includes(key)) { seen.push(key); localStorage.setItem("hanfei_endings", JSON.stringify(seen)); }
}
function renderGallery(currentKey) {
  saveGallery(currentKey);
  const seen = getGallery();
  const dots = $("gallery-dots");
  const section = $("ending-gallery");
  const all = [
    { key: "lonely", short: "孤" },
    { key: "kindred", short: "己" },
    { key: "legacy", short: "良" },
    { key: "regret", short: "恨" }
  ];
  dots.innerHTML = all.map(e => {
    const isSeen = seen.includes(e.key);
    const isCurrent = e.key === currentKey;
    return `<div class="gallery-dot${isSeen ? " seen" : ""}" title="${isSeen ? ENDINGS[e.key].title : "？"}">${isSeen ? e.short : "？"}</div>`;
  }).join("");
  section.hidden = false;
}

function showEnding() {
  setAtmosphere("ending");
  state.korea = Math.min(state.korea, 10);
  const endingMind = state.mind;
  state.mind = Math.max(0, endingMind - 10);
  renderStatus();
  const endingKey = decideEnding();
  const e = ENDINGS[endingKey];
  $("ending-eyebrow").textContent = e.eyebrow;
  $("ending-title").textContent = e.title;
  const bodyParas = [...e.body, ...getMindVariants(endingKey, endingMind)];
  $("ending-body").innerHTML = bodyParas.map(p=>`<p>${escapeHtml(p)}</p>`).join("");
  const epEl = $("ending-epilogue");
  const allEpilogue = [...(e.epilogue || []), ...getVariantEpilogues(endingKey, endingMind)];
  if (allEpilogue.length) {
    epEl.innerHTML = `<p class="epilogue-label">多年以后</p>` + allEpilogue.map(p=>`<p>${escapeHtml(p)}</p>`).join("");
    epEl.hidden = false;
  } else { epEl.hidden = true; epEl.innerHTML = ""; }
  if (state.tags.length) {
    $("ending-tags-list").innerHTML = state.tags.map(t => `<span class="ending-tag">${escapeHtml(t)}</span>`).join("");
    $("ending-tags").hidden = false;
  } else {
    $("ending-tags").hidden = true;
  }
  renderRecap();
  renderGallery(endingKey);
  $("ending-overlay").hidden = false;
}

function openHistory() {
  const ch = STORY[ORDER[chapterIdx]];
  if (!ch || !ch.historyNote) return;
  $("history-title").textContent = ch.chapter || "";
  const note = ch.historyNote || {};
  const factEl = $("history-fact");
  const ficEl = $("history-fiction");
  if (typeof note === "string") {
    factEl.textContent = note;
    ficEl.textContent = "";
    $("history-section-fiction").style.display = "none";
  } else {
    factEl.textContent = note.fact || "";
    ficEl.textContent = note.fiction || "";
    $("history-section-fiction").style.display = note.fiction ? "" : "none";
  }
  $("history-modal").hidden = false;
}
function closeHistory() {
  $("history-modal").hidden = true;
}

function restart() {
  state = { ...INITIAL_STATE, tags: [] };
  chapterIdx = 0;
  queue = [];
  $("ending-overlay").hidden = true;
  $("epigraph-overlay").hidden = true;
  closeHistory();
  $("portrait").hidden = true;
  startChapter("start");
}

/* 点击文本框推进 / 跳过打字 */
$("textbox").addEventListener("click", () => {
  if (!typingDone) { finishTyping(); return; }
  nextBeat();
});
$("epigraph-overlay").addEventListener("click", () => {
  if (!$("epigraph-overlay").hidden) {
    dismissEpigraph(() => nextBeat());
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === " " || e.key === "Enter") {
    if (!$("epigraph-overlay").hidden) {
      e.preventDefault();
      dismissEpigraph(() => nextBeat());
      return;
    }
    if (!$("textbox").hidden) {
      e.preventDefault();
      if (!typingDone) finishTyping(); else nextBeat();
    }
  }
});

document.addEventListener("DOMContentLoaded", () => {
  $("restart-btn").addEventListener("click", restart);
  $("ending-restart").addEventListener("click", restart);
  $("history-btn").addEventListener("click", openHistory);
  $("history-close").addEventListener("click", closeHistory);
  $("history-modal").addEventListener("click", (e) => {
    if (e.target === $("history-modal")) closeHistory();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !$("history-modal").hidden) closeHistory();
  });
  startChapter("start");
});










