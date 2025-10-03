"use client";

import { useState, useEffect, useMemo } from "react";
import { Theme } from "@/types";
import { 
  Download, 
  Search, 
  CheckSquare, 
  Square, 
  Package,
  ArrowLeft,
  Grid3X3,
  List
} from "lucide-react";
import JSZip from "jszip";

interface HeroData {
  name: string;
  displayName: string;
  imageUrl: string;
}

interface HeroLibraryProps {
  theme: Theme;
  onBack: () => void;
}

export default function HeroLibrary({ theme, onBack }: HeroLibraryProps) {
  const [heroes, setHeroes] = useState<HeroData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHeroes, setSelectedHeroes] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [downloading, setDownloading] = useState(false);
  const [imageLoadErrors, setImageLoadErrors] = useState<Set<string>>(new Set());

  // 英雄名称映射（英文名 -> 中文名）
  const heroNameMap: Record<string, string> = {
    'Aatrox': '亚托克斯',
    'Ahri': '阿狸',
    'Akali': '阿卡丽',
    'Akshan': '阿克尚',
    'Alistar': '牛头酋长',
    'Ambessa': '安蓓萨',
    'Amumu': '阿木木',
    'Anivia': '艾尼维亚',
    'Annie': '安妮',
    'Aphelios': '厄斐琉斯',
    'Ashe': '艾希',
    'AurelionSol': '奥瑞利安·索尔',
    'Aurora': '欧若拉',
    'Azir': '阿兹尔',
    'Bard': '巴德',
    'Belveth': '卑尔维斯',
    'Blitzcrank': '布里茨',
    'Brand': '布兰德',
    'Braum': '布隆',
    'Briar': '布里尔',
    'Caitlyn': '凯特琳',
    'Camille': '卡蜜尔',
    'Cassiopeia': '卡西奥佩娅',
    'Chogath': '科加斯',
    'Corki': '库奇',
    'Darius': '德莱厄斯',
    'Diana': '黛安娜',
    'DrMundo': '蒙多医生',
    'Draven': '德莱文',
    'Ekko': '艾克',
    'Elise': '伊莉丝',
    'Evelynn': '伊芙琳',
    'Ezreal': '伊泽瑞尔',
    'Fiddlesticks': '费德提克',
    'Fiora': '菲奥娜',
    'Fizz': '菲兹',
    'Galio': '加里奥',
    'Gangplank': '普朗克',
    'Garen': '盖伦',
    'Gnar': '纳尔',
    'Gragas': '古拉加斯',
    'Graves': '格雷夫斯',
    'Gwen': '格温',
    'Hecarim': '赫卡里姆',
    'Heimerdinger': '黑默丁格',
    'Hwei': '慧',
    'Illaoi': '俄洛伊',
    'Irelia': '艾瑞莉娅',
    'Ivern': '艾翁',
    'Janna': '迦娜',
    'JarvanIV': '嘉文四世',
    'Jax': '贾克斯',
    'Jayce': '杰斯',
    'Jhin': '烬',
    'Jinx': '金克丝',
    'KSante': '奎桑提',
    'Kaisa': '卡莎',
    'Kalista': '卡莉丝塔',
    'Karma': '卡尔玛',
    'Karthus': '卡尔萨斯',
    'Kassadin': '卡萨丁',
    'Katarina': '卡特琳娜',
    'Kayle': '凯尔',
    'Kayn': '凯隐',
    'Kennen': '凯南',
    'Khazix': '卡兹克',
    'Kindred': '千珏',
    'Kled': '克烈',
    'KogMaw': '克格莫',
    'Leblanc': '乐芙兰',
    'LeeSin': '李青',
    'Leona': '蕾欧娜',
    'Lillia': '莉莉娅',
    'Lissandra': '丽桑卓',
    'Lucian': '卢锡安',
    'Lulu': '璐璐',
    'Lux': '拉克丝',
    'Malphite': '墨菲特',
    'Malzahar': '玛尔扎哈',
    'Maokai': '茂凯',
    'MasterYi': '易',
    'Mel': '梅尔',
    'Milio': '米利欧',
    'MissFortune': '厄运小姐',
    'MonkeyKing': '孙悟空',
    'Mordekaiser': '莫德凯撒',
    'Morgana': '莫甘娜',
    'Naafiri': '纳亚菲利',
    'Nami': '娜美',
    'Nasus': '内瑟斯',
    'Nautilus': '诺提勒斯',
    'Neeko': '妮蔻',
    'Nidalee': '奈德丽',
    'Nilah': '尼拉',
    'Nocturne': '魔腾',
    'Nunu': '努努和威朗普',
    'Olaf': '奥拉夫',
    'Orianna': '奥莉安娜',
    'Ornn': '奥恩',
    'Pantheon': '潘森',
    'Poppy': '波比',
    'Pyke': '派克',
    'Qiyana': '奇亚娜',
    'Quinn': '奎因',
    'Rakan': '洛',
    'Rammus': '拉莫斯',
    'RekSai': '雷克塞',
    'Rell': '芮尔',
    'Renata': '烈娜塔·戈拉斯克',
    'Renekton': '雷克顿',
    'Rengar': '雷恩加尔',
    'Riven': '锐雯',
    'Rumble': '兰博',
    'Ryze': '瑞兹',
    'Samira': '莎弥拉',
    'Sejuani': '瑟庄妮',
    'Senna': '赛娜',
    'Seraphine': '萨勒芬妮',
    'Sett': '瑟提',
    'Shaco': '萨科',
    'Shen': '慎',
    'Shyvana': '希瓦娜',
    'Singed': '辛吉德',
    'Sion': '赛恩',
    'Sivir': '希维尔',
    'Skarner': '斯卡纳',
    'Smolder': '斯莫德',
    'Sona': '娑娜',
    'Soraka': '索拉卡',
    'Swain': '斯维因',
    'Sylas': '塞拉斯',
    'Syndra': '辛德拉',
    'TahmKench': '塔姆·肯奇',
    'Taliyah': '塔莉垭',
    'Talon': '泰隆',
    'Taric': '塔里克',
    'Teemo': '提莫',
    'Thresh': '锤石',
    'Tristana': '崔丝塔娜',
    'Trundle': '特朗德尔',
    'Tryndamere': '泰达米尔',
    'TwistedFate': '崔斯特',
    'Twitch': '图奇',
    'Udyr': '乌迪尔',
    'Urgot': '厄加特',
    'Varus': '韦鲁斯',
    'Vayne': '薇恩',
    'Veigar': '维迦',
    'Velkoz': '维克兹',
    'Vex': '薇古丝',
    'Vi': '蔚',
    'Viego': '佛耶戈',
    'Viktor': '维克托',
    'Vladimir': '弗拉基米尔',
    'Volibear': '沃利贝尔',
    'Warwick': '沃里克',
    'Xayah': '霞',
    'Xerath': '泽拉斯',
    'XinZhao': '赵信',
    'Yasuo': '亚索',
    'Yone': '永恩',
    'Yorick': '约里克',
    'Yunara': '云娜拉',
    'Yuumi': '悠米',
    'Zac': '扎克',
    'Zed': '劫',
    'Zeri': '泽丽',
    'Ziggs': '吉格斯',
    'Zilean': '基兰',
    'Zoe': '佐伊',
    'Zyra': '婕拉'
  };

  useEffect(() => {
    loadHeroes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadHeroes = async () => {
    try {
      setLoading(true);
      
      // 获取所有英雄图片文件名
      const heroFiles = [
        'Aatrox.png', 'Ahri.png', 'Akali.png', 'Akshan.png', 'Alistar.png', 'Ambessa.png',
        'Amumu.png', 'Anivia.png', 'Annie.png', 'Aphelios.png', 'Ashe.png', 'AurelionSol.png',
        'Aurora.png', 'Azir.png', 'Bard.png', 'Belveth.png', 'Blitzcrank.png', 'Brand.png',
        'Braum.png', 'Briar.png', 'Caitlyn.png', 'Camille.png', 'Cassiopeia.png', 'Chogath.png',
        'Corki.png', 'Darius.png', 'Diana.png', 'DrMundo.png', 'Draven.png', 'Ekko.png',
        'Elise.png', 'Evelynn.png', 'Ezreal.png', 'Fiddlesticks.png', 'Fiora.png', 'Fizz.png',
        'Galio.png', 'Gangplank.png', 'Garen.png', 'Gnar.png', 'Gragas.png', 'Graves.png',
        'Gwen.png', 'Hecarim.png', 'Heimerdinger.png', 'Hwei.png', 'Illaoi.png', 'Irelia.png',
        'Ivern.png', 'Janna.png', 'JarvanIV.png', 'Jax.png', 'Jayce.png', 'Jhin.png',
        'Jinx.png', 'KSante.png', 'Kaisa.png', 'Kalista.png', 'Karma.png', 'Karthus.png',
        'Kassadin.png', 'Katarina.png', 'Kayle.png', 'Kayn.png', 'Kennen.png', 'Khazix.png',
        'Kindred.png', 'Kled.png', 'KogMaw.png', 'Leblanc.png', 'LeeSin.png', 'Leona.png',
        'Lillia.png', 'Lissandra.png', 'Lucian.png', 'Lulu.png', 'Lux.png', 'Malphite.png',
        'Malzahar.png', 'Maokai.png', 'MasterYi.png', 'Mel.png', 'Milio.png', 'MissFortune.png',
        'MonkeyKing.png', 'Mordekaiser.png', 'Morgana.png', 'Naafiri.png', 'Nami.png', 'Nasus.png',
        'Nautilus.png', 'Neeko.png', 'Nidalee.png', 'Nilah.png', 'Nocturne.png', 'Nunu.png',
        'Olaf.png', 'Orianna.png', 'Ornn.png', 'Pantheon.png', 'Poppy.png', 'Pyke.png',
        'Qiyana.png', 'Quinn.png', 'Rakan.png', 'Rammus.png', 'RekSai.png', 'Rell.png',
        'Renata.png', 'Renekton.png', 'Rengar.png', 'Riven.png', 'Rumble.png', 'Ryze.png',
        'Samira.png', 'Sejuani.png', 'Senna.png', 'Seraphine.png', 'Sett.png', 'Shaco.png',
        'Shen.png', 'Shyvana.png', 'Singed.png', 'Sion.png', 'Sivir.png', 'Skarner.png',
        'Smolder.png', 'Sona.png', 'Soraka.png', 'Swain.png', 'Sylas.png', 'Syndra.png',
        'TahmKench.png', 'Taliyah.png', 'Talon.png', 'Taric.png', 'Teemo.png', 'Thresh.png',
        'Tristana.png', 'Trundle.png', 'Tryndamere.png', 'TwistedFate.png', 'Twitch.png', 'Udyr.png',
        'Urgot.png', 'Varus.png', 'Vayne.png', 'Veigar.png', 'Velkoz.png', 'Vex.png',
        'Vi.png', 'Viego.png', 'Viktor.png', 'Vladimir.png', 'Volibear.png', 'Warwick.png',
        'Xayah.png', 'Xerath.png', 'XinZhao.png', 'Yasuo.png', 'Yone.png', 'Yorick.png',
        'Yunara.png', 'Yuumi.png', 'Zac.png', 'Zed.png', 'Zeri.png', 'Ziggs.png',
        'Zilean.png', 'Zoe.png', 'Zyra.png'
      ];

      const heroData: HeroData[] = heroFiles.map(filename => {
        const name = filename.replace('.png', '');
        return {
          name,
          displayName: heroNameMap[name] || name,
          imageUrl: `/hero/${filename}`
        };
      });

      setHeroes(heroData);
    } catch (error) {
      console.error('Failed to load heroes:', error);
    } finally {
      setLoading(false);
    }
  };

  // 过滤英雄
  const filteredHeroes = useMemo(() => {
    if (!searchQuery) return heroes;
    
    const query = searchQuery.toLowerCase();
    return heroes.filter(hero => 
      hero.name.toLowerCase().includes(query) ||
      hero.displayName.toLowerCase().includes(query)
    );
  }, [heroes, searchQuery]);

  // 选择/取消选择英雄
  const toggleHeroSelection = (heroName: string) => {
    const newSelected = new Set(selectedHeroes);
    if (newSelected.has(heroName)) {
      newSelected.delete(heroName);
    } else {
      newSelected.add(heroName);
    }
    setSelectedHeroes(newSelected);
  };

  // 全选/取消全选
  const toggleSelectAll = () => {
    if (selectedHeroes.size === filteredHeroes.length) {
      setSelectedHeroes(new Set());
    } else {
      setSelectedHeroes(new Set(filteredHeroes.map(hero => hero.name)));
    }
  };

  // 批量下载
  const downloadSelected = async () => {
    if (selectedHeroes.size === 0) {
      alert('请先选择要下载的英雄头像');
      return;
    }

    setDownloading(true);
    
    try {
      const zip = new JSZip();
      const selectedHeroData = heroes.filter(hero => selectedHeroes.has(hero.name));
      
      // 显示进度
      let completed = 0;
      const total = selectedHeroData.length;
      
      for (const hero of selectedHeroData) {
        try {
          const response = await fetch(hero.imageUrl);
          const blob = await response.blob();
          zip.file(`${hero.displayName}_${hero.name}.png`, blob);
          
          completed++;
          console.log(`下载进度: ${completed}/${total} - ${hero.displayName}`);
        } catch (error) {
          console.warn(`Failed to download ${hero.name}:`, error);
        }
      }
      
      // 生成并下载 ZIP 文件
      const content = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(content);
      const link = document.createElement('a');
      link.href = url;
      link.download = `LOL英雄头像_${selectedHeroes.size}个_${new Date().toISOString().split('T')[0]}.zip`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      URL.revokeObjectURL(url);
      
      // 显示成功提示
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        font-family: Arial, sans-serif;
        font-size: 14px;
      `;
      notification.textContent = `🎉 成功下载 ${selectedHeroes.size} 个英雄头像！`;
      document.body.appendChild(notification);
      
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 3000);
      
    } catch (error) {
      console.error('Download failed:', error);
      alert('下载失败，请稍后重试');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" 
               style={{ borderColor: theme.primary }}></div>
          <p style={{ color: theme.text }}>加载英雄头像中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 头部 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: theme.secondary,
              color: theme.text 
            }}
          >
            <ArrowLeft size={20} />
            返回
          </button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: theme.text }}>
              LOL 英雄头像素材
            </h1>
            <p className="text-sm opacity-70" style={{ color: theme.text }}>
              共 {heroes.length} 个英雄头像，已选择 {selectedHeroes.size} 个
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 调试按钮 */}
          <button
            onClick={() => {
              console.log('=== 图片加载调试信息 ===');
              console.log('Heroes count:', heroes.length);
              console.log('Image load errors:', Array.from(imageLoadErrors));
              console.log('Sample hero image URL:', heroes[0]?.imageUrl);
              
              // 测试第一个图片是否可以加载
              if (heroes[0]) {
                const testImg = new Image();
                testImg.onload = () => console.log('✅ Test image loaded successfully');
                testImg.onerror = () => console.log('❌ Test image failed to load');
                testImg.src = heroes[0].imageUrl;
              }
            }}
            className="px-3 py-1 text-xs rounded"
            style={{ backgroundColor: theme.secondary, color: theme.text }}
          >
            调试
          </button>
          
          {/* 视图切换 */}
          <div className="flex rounded-lg overflow-hidden" style={{ backgroundColor: theme.secondary }}>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition-colors ${viewMode === 'grid' ? 'opacity-100' : 'opacity-60'}`}
              style={{ color: theme.text }}
            >
              <Grid3X3 size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition-colors ${viewMode === 'list' ? 'opacity-100' : 'opacity-60'}`}
              style={{ color: theme.text }}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* 搜索和操作栏 */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        {/* 搜索框 */}
        <div className="relative flex-1 max-w-md">
          <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 opacity-50" 
                  style={{ color: theme.text }} />
          <input
            type="text"
            placeholder="搜索英雄名称..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border-none outline-none"
            style={{ 
              backgroundColor: theme.secondary,
              color: theme.text 
            }}
          />
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-2">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors"
            style={{ 
              backgroundColor: theme.secondary,
              color: theme.text 
            }}
          >
            {selectedHeroes.size === filteredHeroes.length ? (
              <CheckSquare size={20} />
            ) : (
              <Square size={20} />
            )}
            {selectedHeroes.size === filteredHeroes.length ? '取消全选' : '全选'}
          </button>

          <button
            onClick={downloadSelected}
            disabled={selectedHeroes.size === 0 || downloading}
            className="flex items-center gap-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
            style={{ 
              backgroundColor: theme.primary,
              color: '#ffffff'
            }}
          >
            {downloading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                下载中...
              </>
            ) : (
              <>
                <Download size={20} />
                下载选中 ({selectedHeroes.size})
              </>
            )}
          </button>
        </div>
      </div>

      {/* 英雄网格/列表 */}
      {filteredHeroes.length === 0 ? (
        <div className="text-center py-12">
          <Package size={64} className="mx-auto mb-4 opacity-50" style={{ color: theme.text }} />
          <p className="text-lg opacity-70" style={{ color: theme.text }}>
            没有找到匹配的英雄
          </p>
        </div>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4"
            : "space-y-2"
        }>
          {filteredHeroes.map((hero) => (
            <div
              key={hero.name}
              className={`
                relative group cursor-pointer transition-all duration-200 hover:scale-105
                ${viewMode === 'grid' ? 'aspect-square' : 'flex items-center gap-3 p-3'}
              `}
              style={{ 
                backgroundColor: theme.surface,
                borderRadius: '8px',
                overflow: 'hidden',
                ...(selectedHeroes.has(hero.name) ? {
                  outline: `2px solid ${theme.primary}`
                } : {})
              }}
              onClick={() => toggleHeroSelection(hero.name)}
            >
              {viewMode === 'grid' ? (
                <>
                  <img
                    src={hero.imageUrl}
                    alt={hero.displayName}
                    className="w-full h-full object-cover"
                    onError={(_e) => { 
                      console.warn(`Failed to load image: ${hero.imageUrl}`);
                      setImageLoadErrors(prev => new Set([...prev, hero.name]));
                    }}
                    onLoad={(_e) => {
                      console.log(`Successfully loaded image: ${hero.name}`);
                    }}
                  />
                  {/* 选中状态指示器 */}
                  {selectedHeroes.has(hero.name) && (
                    <div className="absolute top-2 right-2 z-10">
                      <CheckSquare size={20} className="text-white drop-shadow-lg" />
                    </div>
                  )}
                  
                  {/* 悬停覆盖层 */}
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-200 pointer-events-none"></div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white text-xs p-1 rounded-b-lg flex items-center justify-center gap-2">
                    <div className="font-medium truncate">{hero.displayName}</div>
                    <div className="opacity-70 truncate">{hero.name}</div>
                  </div>
                </>
              ) : (
                <>
                  <img
                    src={hero.imageUrl}
                    alt={hero.displayName}
                    className="w-12 h-12 object-cover rounded-lg"
                    onError={(_e) => {
                      console.warn(`Failed to load image: ${hero.imageUrl}`);
                      setImageLoadErrors(prev => new Set([...prev, hero.name]));
                    }}
                    onLoad={(_e) => {
                      console.log(`Successfully loaded image: ${hero.name}`);
                    }}
                  />
                  <div className="flex-1">
                    <div className="font-medium" style={{ color: theme.text }}>
                      {hero.displayName}
                    </div>
                    <div className="text-sm opacity-70" style={{ color: theme.text }}>
                      {hero.name}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {selectedHeroes.has(hero.name) ? (
                      <CheckSquare size={20} style={{ color: theme.primary }} />
                    ) : (
                      <Square size={20} style={{ color: theme.text }} className="opacity-50" />
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
