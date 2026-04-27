/**
 * 菜谱模板配置文件
 * 包含常用菜谱的初始化数据，用于快速填充
 */

export const recipeTemplates = [
  // 原有菜品
  {
    name: '番茄炒蛋',
    keywords: ['西红柿炒蛋', '番茄鸡蛋', '西红柿鸡蛋', 'tomato'],
    category: '家常菜',
    duration: '10分钟',
    difficulty: '简单',
    ingredients: [
      { name: '番茄', amount: '2个', isSeasoning: false },
      { name: '鸡蛋', amount: '3个', isSeasoning: false },
      { name: '白糖', amount: '1勺', isSeasoning: true },
      { name: '盐', amount: '适量', isSeasoning: true },
      { name: '葱花', amount: '少许', isSeasoning: true }
    ],
    steps: ['番茄洗净切块，鸡蛋打散备用', '起锅烧油，将蛋液炒至凝固盛出', '锅留底油，下番茄块炒出汁水', '加入鸡蛋和调料翻炒均匀即可']
  },
  {
    name: '青椒肉丝',
    keywords: ['尖椒肉丝', '猪肉炒青椒', '青椒炒肉'],
    category: '家常菜',
    duration: '20分钟',
    difficulty: '中等',
    ingredients: [
      { name: '猪里脊', amount: '200g', isSeasoning: false },
      { name: '青椒', amount: '3个', isSeasoning: false },
      { name: '生抽', amount: '1勺', isSeasoning: true },
      { name: '料酒', amount: '1勺', isSeasoning: true },
      { name: '淀粉', amount: '少许', isSeasoning: true },
      { name: '大蒜', amount: '2瓣', isSeasoning: true }
    ],
    steps: ['里脊肉切丝，用生抽、料酒、淀粉腌制15分钟', '青椒去籽切丝，大蒜切末', '热锅凉油，下肉丝滑散至变色盛出', '锅底油爆香蒜末，下青椒丝炒至断生', '加入肉丝和调料大火快炒出锅']
  },
  {
    name: '红烧肉',
    keywords: ['猪肉', '五花肉', '红烧五花肉'],
    category: '肉类',
    duration: '60分钟',
    difficulty: '困难',
    ingredients: [
      { name: '五花肉', amount: '500g', isSeasoning: false },
      { name: '冰糖', amount: '10粒', isSeasoning: true },
      { name: '八角', amount: '2个', isSeasoning: true },
      { name: '桂皮', amount: '1小块', isSeasoning: true },
      { name: '老抽', amount: '1勺', isSeasoning: true },
      { name: '生姜', amount: '4片', isSeasoning: true }
    ],
    steps: ['五花肉切块，冷水下锅焯水捞出沥干', '锅中少油下冰糖，小火熬出糖色', '下肉块翻炒上色，放入姜片、八角、桂皮', '加入老抽、生抽，倒入没过肉的热水', '大火烧开转小火焖煮45-50分钟', '最后大火收汁至汤汁浓稠']
  },
  {
    name: '宫保鸡丁',
    keywords: ['鸡肉', '花生米', '川菜'],
    category: '家常菜',
    duration: '25分钟',
    difficulty: '中等',
    ingredients: [
      { name: '鸡胸肉', amount: '300g', isSeasoning: false },
      { name: '黄瓜', amount: '半根', isSeasoning: false },
      { name: '炸花生米', amount: '1小碗', isSeasoning: false },
      { name: '干辣椒', amount: '5个', isSeasoning: true },
      { name: '豆瓣酱', amount: '1勺', isSeasoning: true },
      { name: '陈醋', amount: '2勺', isSeasoning: true }
    ],
    steps: ['鸡肉切丁腌制，黄瓜切丁，干辣椒剪段', '调料汁：醋、糖、生抽、淀粉、水', '锅中油热下鸡丁滑熟盛出', '下干辣椒、花椒爆香，加豆瓣酱炒出红油', '倒入鸡丁、黄瓜丁翻炒，倒入料汁大火收汁', '最后撒入花生米即可出锅']
  },
  {
    name: '麻婆豆腐',
    keywords: ['豆腐', '麻辣', '经典川菜'],
    category: '素食',
    duration: '15分钟',
    difficulty: '中等',
    ingredients: [
      { name: '嫩豆腐', amount: '1盒', isSeasoning: false },
      { name: '牛肉末/猪肉末', amount: '50g', isSeasoning: false },
      { name: '豆瓣酱', amount: '1勺', isSeasoning: true },
      { name: '花椒粉', amount: '适量', isSeasoning: true },
      { name: '水淀粉', amount: '少许', isSeasoning: true }
    ],
    steps: ['豆腐切块盐水焯一下去豆腥', '炒锅下油，下肉末炒散，加豆瓣酱炒红', '加入少量水，放入豆腐中火焖煮3分钟', '淋入水淀粉勾芡，出锅前撒大量花椒粉']
  },
  {
    name: '酸辣土豆丝',
    keywords: ['土豆', '马铃薯', '快手小菜'],
    category: '素食',
    duration: '10分钟',
    difficulty: '简单',
    ingredients: [
      { name: '土豆', amount: '1个', isSeasoning: false },
      { name: '白醋', amount: '2勺', isSeasoning: true },
      { name: '干辣椒', amount: '3个', isSeasoning: true },
      { name: '盐', amount: '少许', isSeasoning: true }
    ],
    steps: ['土豆切细丝，多换几次水洗去淀粉', '起锅烧油爆香辣椒和花椒', '下土豆丝大火快炒，边炒边淋醋', '加盐调味，炒至断生保持爽脆即可']
  },
  {
    name: '可乐鸡翅',
    keywords: ['鸡翅', '可口可乐鸡翅', 'wings'],
    category: '快手菜',
    duration: '30分钟',
    difficulty: '简单',
    ingredients: [
      { name: '鸡翅中', amount: '8-10个', isSeasoning: false },
      { name: '可乐', amount: '1瓶(330ml)', isSeasoning: false },
      { name: '生姜', amount: '3片', isSeasoning: true },
      { name: '料酒', amount: '1勺', isSeasoning: true },
      { name: '老抽', amount: '半勺', isSeasoning: true }
    ],
    steps: ['鸡翅洗净划两刀，冷水下锅加料酒姜片焯水捞出', '锅中少许油，下鸡翅煎至两面金黄', '倒入可乐、生抽、老抽，没过鸡翅', '大火烧开转中小火煮20分钟', '最后大火收汁至浓稠包裹住鸡翅']
  },
  {
    name: '凉拌黄瓜',
    keywords: ['拍黄瓜', '爽口', '冷菜'],
    category: '素食',
    duration: '5分钟',
    difficulty: '简单',
    ingredients: [
      { name: '黄瓜', amount: '2根', isSeasoning: false },
      { name: '大蒜', amount: '3瓣', isSeasoning: true },
      { name: '香醋', amount: '2勺', isSeasoning: true },
      { name: '芝麻油', amount: '1勺', isSeasoning: true },
      { name: '辣椒油', amount: '1勺', isSeasoning: true }
    ],
    steps: ['黄瓜洗净拍碎切段，大蒜捣成泥', '加入盐腌制5分钟，滤掉多余水分', '加入醋、糖、生抽、蒜泥、油辣子拌匀', '最后淋上芝麻油即可']
  },
  {
    name: '鱼香肉丝',
    keywords: ['木耳', '胡萝卜', '鱼香味'],
    category: '家常菜',
    duration: '25分钟',
    difficulty: '中等',
    ingredients: [
      { name: '猪瘦肉', amount: '250g', isSeasoning: false },
      { name: '黑木耳', amount: '少许', isSeasoning: false },
      { name: '胡萝卜', amount: '半根', isSeasoning: false },
      { name: '泡椒', amount: '3个', isSeasoning: true },
      { name: '白糖', amount: '2勺', isSeasoning: true },
      { name: '陈醋', amount: '2勺', isSeasoning: true }
    ],
    steps: ['肉、木耳、胡萝卜全部切丝，肉丝腌制', '调鱼香汁：糖、醋、生抽、淀粉、水(比例约2:2:1)', '炒锅下油滑熟肉丝盛出', '爆香葱姜蒜末和泡椒末', '下木耳胡萝卜丝炒熟，倒回肉丝和料汁', '大火翻炒至芡汁透亮即可']
  },
  {
    name: '回锅肉',
    keywords: ['猪肉', '蒜苗', '五花肉'],
    category: '肉类',
    duration: '30分钟',
    difficulty: '中等',
    ingredients: [
      { name: '五花肉', amount: '300g', isSeasoning: false },
      { name: '蒜苗', amount: '1把', isSeasoning: false },
      { name: '郫县豆瓣酱', amount: '1勺', isSeasoning: true },
      { name: '豆豉', amount: '少许', isSeasoning: true },
      { name: '白糖', amount: '少许', isSeasoning: true }
    ],
    steps: ['整块五花肉冷水下锅煮至八成熟，捞出切薄片', '蒜苗切段，姜蒜切片', '锅中不加油或少油下肉片中小火煸炒出油', '肉片打卷(灯盏窝)后下豆瓣酱、豆豉炒香', '下姜蒜片翻炒，最后下蒜苗段和糖', '大火快炒至蒜苗断生即可出锅']
  },
  {
    name: '蒜蓉西兰花',
    keywords: ['炒西兰花', '蒜泥西兰花', '素炒西兰花'],
    category: '素食',
    duration: '15分钟',
    difficulty: '简单',
    ingredients: [
      { name: '西兰花', amount: '1棵', isSeasoning: false },
      { name: '大蒜', amount: '5瓣', isSeasoning: true },
      { name: '蚝油', amount: '1勺', isSeasoning: true },
      { name: '盐', amount: '少许', isSeasoning: true }
    ],
    steps: ['西兰花掰小朵，盐水浸泡10分钟后焯水备用', '大蒜切末，准备好料汁(蚝油+水)', '起锅烧油下蒜末爆香', '放入西兰花翻炒，倒入料汁大火收汁']
  },
  {
    name: '紫菜蛋花汤',
    keywords: ['紫菜', '鸡蛋', '汤'],
    category: '汤品',
    duration: '5分钟',
    difficulty: '简单',
    ingredients: [
      { name: '紫菜', amount: '1小盘', isSeasoning: false },
      { name: '鸡蛋', amount: '1个', isSeasoning: false },
      { name: '香油', amount: '少许', isSeasoning: true },
      { name: '虾皮', amount: '少许', isSeasoning: true }
    ],
    steps: ['锅中加水烧开，紫菜撕碎放入', '加盐调味，再次煮开后淋入蛋液', '熄火，撒上葱花、虾皮，淋上香油']
  },

  // ===================== 以下为全部新增菜品 =====================
  {
    name: '西红柿炒鸡蛋',
    keywords: ['番茄炒蛋', '番茄鸡蛋', '西红柿鸡蛋'],
    category: '家常菜',
    duration: '10分钟',
    difficulty: '简单',
    ingredients: [
      { name: '西红柿', amount: '2个', isSeasoning: false },
      { name: '鸡蛋', amount: '3个', isSeasoning: false },
      { name: '白糖', amount: '1勺', isSeasoning: true },
      { name: '盐', amount: '适量', isSeasoning: true },
      { name: '葱花', amount: '少许', isSeasoning: true }
    ],
    steps: ['西红柿洗净切块，鸡蛋加盐打散', '热油炒鸡蛋至定型盛出', '炒西红柿出沙，加糖盐调味', '倒入鸡蛋翻炒均匀，撒葱花出锅']
  },
  {
    name: '糖醋排骨',
    keywords: ['酸甜排骨', '糖醋小排', '红烧排骨'],
    category: '肉类',
    duration: '40分钟',
    difficulty: '中等',
    ingredients: [
      { name: '排骨', amount: '500g', isSeasoning: false },
      { name: '冰糖', amount: '2勺', isSeasoning: true },
      { name: '香醋', amount: '3勺', isSeasoning: true },
      { name: '生抽', amount: '1勺', isSeasoning: true },
      { name: '姜片', amount: '3片', isSeasoning: true }
    ],
    steps: ['排骨焯水洗净沥干', '炒糖色后下排骨翻炒上色', '加生抽、醋、热水焖煮30分钟', '大火收汁至浓稠亮红即可']
  },
  {
    name: '手撕包菜',
    keywords: ['包菜', '手撕卷心菜', '干锅包菜'],
    category: '素食',
    duration: '8分钟',
    difficulty: '简单',
    ingredients: [
      { name: '包菜', amount: '半个', isSeasoning: false },
      { name: '大蒜', amount: '3瓣', isSeasoning: true },
      { name: '干辣椒', amount: '3个', isSeasoning: true },
      { name: '生抽', amount: '1勺', isSeasoning: true },
      { name: '盐', amount: '少许', isSeasoning: true }
    ],
    steps: ['包菜用手撕成小块洗净', '热油爆香蒜和干辣椒', '下包菜大火快炒至断生', '加生抽和盐调味出锅']
  },
  {
    name: '干煸四季豆',
    keywords: ['四季豆', '干煸豆角', '川味豆角'],
    category: '素食',
    duration: '15分钟',
    difficulty: '中等',
    ingredients: [
      { name: '四季豆', amount: '300g', isSeasoning: false },
      { name: '肉末', amount: '50g', isSeasoning: false },
      { name: '干辣椒', amount: '4个', isSeasoning: true },
      { name: '花椒', amount: '少许', isSeasoning: true },
      { name: '盐', amount: '适量', isSeasoning: true }
    ],
    steps: ['四季豆去筋掰段，擦干水分', '少油煸至四季豆起皱皮盛出', '炒香肉末、辣椒、花椒', '倒回四季豆翻炒调味出锅']
  },
  {
    name: '地三鲜',
    keywords: ['土豆茄子青椒', '东北三鲜', '素菜三鲜'],
    category: '素食',
    duration: '20分钟',
    difficulty: '简单',
    ingredients: [
      { name: '土豆', amount: '1个', isSeasoning: false },
      { name: '茄子', amount: '1根', isSeasoning: false },
      { name: '青椒', amount: '1个', isSeasoning: false },
      { name: '生抽', amount: '1勺', isSeasoning: true },
      { name: '盐', amount: '适量', isSeasoning: true }
    ],
    steps: ['土豆、茄子、青椒切块', '分别炸至金黄捞出', '锅留底油翻炒食材', '加调料炒匀即可']
  },
  {
    name: '醋溜白菜',
    keywords: ['酸辣白菜', '醋白菜', '快手白菜'],
    category: '素食',
    duration: '8分钟',
    difficulty: '简单',
    ingredients: [
      { name: '大白菜', amount: '300g', isSeasoning: false },
      { name: '香醋', amount: '2勺', isSeasoning: true },
      { name: '干辣椒', amount: '3个', isSeasoning: true },
      { name: '盐', amount: '少许', isSeasoning: true }
    ],
    steps: ['白菜洗净撕片', '爆香辣椒，下白菜大火翻炒', '沿锅边淋醋，加盐调味即可']
  },
  {
    name: '红烧茄子',
    keywords: ['油焖茄子', '酱香茄子', '茄子'],
    category: '素食',
    duration: '15分钟',
    difficulty: '简单',
    ingredients: [
      { name: '茄子', amount: '2根', isSeasoning: false },
      { name: '大蒜', amount: '4瓣', isSeasoning: true },
      { name: '生抽', amount: '1勺', isSeasoning: true },
      { name: '老抽', amount: '半勺', isSeasoning: true },
      { name: '盐', amount: '少许', isSeasoning: true }
    ],
    steps: ['茄子切条，加盐腌出水分挤干', '煎至变软金黄', '加蒜末、生抽、老抽翻炒', '焖2分钟收汁即可']
  },
  {
    name: '蒜蓉空心菜',
    keywords: ['空心菜', '蒜蓉通菜', '快手青菜'],
    category: '素食',
    duration: '5分钟',
    difficulty: '简单',
    ingredients: [
      { name: '空心菜', amount: '1把', isSeasoning: false },
      { name: '大蒜', amount: '5瓣', isSeasoning: true },
      { name: '盐', amount: '少许', isSeasoning: true }
    ],
    steps: ['空心菜洗净切段', '热油爆香大量蒜末', '下空心菜大火快炒至断生', '加盐调味出锅']
  },
  {
    name: '清炒西兰花',
    keywords: ['西兰花', '素炒西兰花', '清淡蔬菜'],
    category: '素食',
    duration: '10分钟',
    difficulty: '简单',
    ingredients: [
      { name: '西兰花', amount: '1棵', isSeasoning: false },
      { name: '大蒜', amount: '2瓣', isSeasoning: true },
      { name: '盐', amount: '少许', isSeasoning: true }
    ],
    steps: ['西兰花焯水备用', '爆香蒜末，下西兰花翻炒', '加盐调味即可']
  },
  {
    name: '蚝油生菜',
    keywords: ['生菜', '蚝油青菜', '快手生菜'],
    category: '素食',
    duration: '5分钟',
    difficulty: '简单',
    ingredients: [
      { name: '生菜', amount: '1颗', isSeasoning: false },
      { name: '蚝油', amount: '1勺', isSeasoning: true },
      { name: '大蒜', amount: '2瓣', isSeasoning: true }
    ],
    steps: ['生菜洗净', '焯水10秒捞出摆盘', '热油爆香蒜末，加蚝油调成酱汁', '淋在生菜上即可']
  },
  {
    name: '香菇油菜',
    keywords: ['香菇青菜', '油菜', '素菜'],
    category: '素食',
    duration: '10分钟',
    difficulty: '简单',
    ingredients: [
      { name: '油菜', amount: '300g', isSeasoning: false },
      { name: '干香菇', amount: '5朵', isSeasoning: false },
      { name: '蚝油', amount: '1勺', isSeasoning: true },
      { name: '盐', amount: '少许', isSeasoning: true }
    ],
    steps: ['香菇泡发切花刀，油菜洗净', '分别焯水备用', '炒香香菇，加蚝油和少许水', '放入油菜翻炒均匀']
  },
  {
    name: '家常豆腐',
    keywords: ['老豆腐', '煎豆腐', '红烧豆腐'],
    category: '素食',
    duration: '15分钟',
    difficulty: '简单',
    ingredients: [
      { name: '老豆腐', amount: '1块', isSeasoning: false },
      { name: '青椒', amount: '1个', isSeasoning: false },
      { name: '胡萝卜', amount: '少许', isSeasoning: false },
      { name: '生抽', amount: '1勺', isSeasoning: true },
      { name: '盐', amount: '适量', isSeasoning: true }
    ],
    steps: ['豆腐切块煎至两面金黄', '下青椒、胡萝卜翻炒', '加生抽、盐和少许水焖煮', '收汁即可']
  },
  {
    name: '韭菜炒鸡蛋',
    keywords: ['韭菜鸡蛋', '春菜', '快手菜'],
    category: '家常菜',
    duration: '8分钟',
    difficulty: '简单',
    ingredients: [
      { name: '韭菜', amount: '1小把', isSeasoning: false },
      { name: '鸡蛋', amount: '3个', isSeasoning: false },
      { name: '盐', amount: '适量', isSeasoning: true }
    ],
    steps: ['鸡蛋炒熟盛出', '韭菜切段大火快炒', '倒入鸡蛋加盐炒匀']
  },
  {
    name: '木须肉',
    keywords: ['木须肉', '黄瓜木耳炒肉', '家常菜'],
    category: '家常菜',
    duration: '15分钟',
    difficulty: '中等',
    ingredients: [
      { name: '猪瘦肉', amount: '100g', isSeasoning: false },
      { name: '鸡蛋', amount: '2个', isSeasoning: false },
      { name: '黄瓜', amount: '半根', isSeasoning: false },
      { name: '木耳', amount: '少许', isSeasoning: false },
      { name: '生抽', amount: '1勺', isSeasoning: true }
    ],
    steps: ['鸡蛋炒熟，肉片滑炒至变色', '炒香黄瓜和木耳', '混合所有食材，加生抽调味']
  },
  {
    name: '肉末茄子',
    keywords: ['茄子肉末', '酱香茄子', '下饭菜'],
    category: '家常菜',
    duration: '15分钟',
    difficulty: '简单',
    ingredients: [
      { name: '茄子', amount: '2根', isSeasoning: false },
      { name: '猪肉末', amount: '100g', isSeasoning: false },
      { name: '大蒜', amount: '3瓣', isSeasoning: true },
      { name: '生抽', amount: '1勺', isSeasoning: true },
      { name: '豆瓣酱', amount: '半勺', isSeasoning: true }
    ],
    steps: ['茄子煎软备用', '炒香肉末和豆瓣酱', '加茄子翻炒，调味焖煮2分钟']
  },
  {
    name: '豇豆炒肉',
    keywords: ['长豆角炒肉', '豇豆肉丝', '下饭菜'],
    category: '家常菜',
    duration: '15分钟',
    difficulty: '简单',
    ingredients: [
      { name: '豇豆', amount: '300g', isSeasoning: false },
      { name: '猪肉', amount: '100g', isSeasoning: false },
      { name: '大蒜', amount: '2瓣', isSeasoning: true },
      { name: '盐', amount: '适量', isSeasoning: true }
    ],
    steps: ['豇豆切段焯水', '肉片炒至变色', '下豇豆翻炒调味']
  },
  {
    name: '洋葱炒肉',
    keywords: ['洋葱肉丝', '洋葱炒猪肉', '家常菜'],
    category: '家常菜',
    duration: '12分钟',
    difficulty: '简单',
    ingredients: [
      { name: '洋葱', amount: '1个', isSeasoning: false },
      { name: '猪瘦肉', amount: '150g', isSeasoning: false },
      { name: '生抽', amount: '1勺', isSeasoning: true },
      { name: '盐', amount: '少许', isSeasoning: true }
    ],
    steps: ['肉片腌制滑炒至变色', '洋葱炒软', '混合翻炒调味']
  },
  {
    name: '尖椒炒蛋',
    keywords: ['青椒炒蛋', '尖椒鸡蛋', '快手菜'],
    category: '家常菜',
    duration: '8分钟',
    difficulty: '简单',
    ingredients: [
      { name: '尖椒', amount: '3个', isSeasoning: false },
      { name: '鸡蛋', amount: '3个', isSeasoning: false },
      { name: '盐', amount: '适量', isSeasoning: true }
    ],
    steps: ['鸡蛋炒熟盛出', '尖椒炒至断生', '混合加盐翻炒均匀']
  },
  {
    name: '蒜苔炒肉',
    keywords: ['蒜薹炒肉', '蒜苗炒肉', '下饭菜'],
    category: '家常菜',
    duration: '15分钟',
    difficulty: '简单',
    ingredients: [
      { name: '蒜苔', amount: '200g', isSeasoning: false },
      { name: '猪肉', amount: '150g', isSeasoning: false },
      { name: '生抽', amount: '1勺', isSeasoning: true },
      { name: '盐', amount: '少许', isSeasoning: true }
    ],
    steps: ['肉片炒熟盛出', '蒜苔炒至断生', '混合翻炒调味']
  },
  {
    name: '荷兰豆炒腊肠',
    keywords: ['荷兰豆', '腊肠炒荷兰豆', '腊味'],
    category: '家常菜',
    duration: '10分钟',
    difficulty: '简单',
    ingredients: [
      { name: '荷兰豆', amount: '200g', isSeasoning: false },
      { name: '广式腊肠', amount: '2根', isSeasoning: false },
      { name: '大蒜', amount: '2瓣', isSeasoning: true },
      { name: '盐', amount: '少许', isSeasoning: true }
    ],
    steps: ['腊肠切片煎出油', '爆香蒜片，下荷兰豆快炒', '混合调味出锅']
  },
  {
    name: '西葫芦炒鸡蛋',
    keywords: ['角瓜炒蛋', '西葫芦鸡蛋', '素菜'],
    category: '素食',
    duration: '10分钟',
    difficulty: '简单',
    ingredients: [
      { name: '西葫芦', amount: '1根', isSeasoning: false },
      { name: '鸡蛋', amount: '2个', isSeasoning: false },
      { name: '盐', amount: '适量', isSeasoning: true }
    ],
    steps: ['鸡蛋炒熟盛出', '西葫芦炒软', '混合加盐调味']
  },
  {
    name: '丝瓜炒蛋',
    keywords: ['丝瓜鸡蛋', '清淡丝瓜', '快手菜'],
    category: '素食',
    duration: '10分钟',
    difficulty: '简单',
    ingredients: [
      { name: '丝瓜', amount: '1根', isSeasoning: false },
      { name: '鸡蛋', amount: '2个', isSeasoning: false },
      { name: '盐', amount: '适量', isSeasoning: true }
    ],
    steps: ['鸡蛋炒熟', '丝瓜炒软出水', '混合翻炒调味']
  },
  {
    name: '苦瓜炒肉',
    keywords: ['凉瓜炒肉', '苦瓜肉片', '下饭菜'],
    category: '家常菜',
    duration: '15分钟',
    difficulty: '简单',
    ingredients: [
      { name: '苦瓜', amount: '1根', isSeasoning: false },
      { name: '猪肉', amount: '150g', isSeasoning: false },
      { name: '盐', amount: '适量', isSeasoning: true },
      { name: '生抽', amount: '半勺', isSeasoning: true }
    ],
    steps: ['苦瓜去瓤切片焯水去苦', '肉片炒熟', '混合翻炒调味']
  },
  {
    name: '虎皮青椒',
    keywords: ['虎皮辣椒', '煎青椒', '素菜'],
    category: '素食',
    duration: '10分钟',
    difficulty: '简单',
    ingredients: [
      { name: '青椒', amount: '5个', isSeasoning: false },
      { name: '生抽', amount: '1勺', isSeasoning: true },
      { name: '香醋', amount: '半勺', isSeasoning: true },
      { name: '盐', amount: '少许', isSeasoning: true }
    ],
    steps: ['青椒煎至表皮起皱', '加调料翻炒入味']
  },
  {
    name: '酸豆角炒肉末',
    keywords: ['酸豆角肉末', '下饭菜', '开胃菜'],
    category: '家常菜',
    duration: '10分钟',
    difficulty: '简单',
    ingredients: [
      { name: '酸豆角', amount: '1小把', isSeasoning: false },
      { name: '猪肉末', amount: '100g', isSeasoning: false },
      { name: '干辣椒', amount: '2个', isSeasoning: true },
      { name: '盐', amount: '少许', isSeasoning: true }
    ],
    steps: ['肉末炒散变色', '酸豆角炒干水分', '混合翻炒调味']
  },
  {
    name: '腐竹炒木耳',
    keywords: ['木耳腐竹', '素炒腐竹', '家常菜'],
    category: '素食',
    duration: '10分钟',
    difficulty: '简单',
    ingredients: [
      { name: '干腐竹', amount: '1把', isSeasoning: false },
      { name: '干木耳', amount: '少许', isSeasoning: false },
      { name: '大蒜', amount: '2瓣', isSeasoning: true },
      { name: '生抽', amount: '1勺', isSeasoning: true }
    ],
    steps: ['腐竹、木耳泡发焯水', '爆香蒜末翻炒食材', '加生抽调味']
  },
  {
    name: '西红柿炒菜花',
    keywords: ['番茄菜花', '素菜菜花', '清淡菜'],
    category: '素食',
    duration: '12分钟',
    difficulty: '简单',
    ingredients: [
      { name: '菜花', amount: '小半颗', isSeasoning: false },
      { name: '西红柿', amount: '1个', isSeasoning: false },
      { name: '盐', amount: '适量', isSeasoning: true }
    ],
    steps: ['菜花焯水备用', '西红柿炒出汁', '加菜花翻炒入味']
  },
  {
    name: '蒜蓉娃娃菜',
    keywords: ['娃娃菜', '蒜蓉青菜', '快手菜'],
    category: '素食',
    duration: '8分钟',
    difficulty: '简单',
    ingredients: [
      { name: '娃娃菜', amount: '1颗', isSeasoning: false },
      { name: '大蒜', amount: '5瓣', isSeasoning: true },
      { name: '蚝油', amount: '1勺', isSeasoning: true }
    ],
    steps: ['娃娃菜洗净切条', '爆香蒜蓉，下娃娃菜炒软', '加蚝油调味']
  },
  {
    name: '清炒豆苗',
    keywords: ['豌豆苗', '清炒时蔬', '清淡菜'],
    category: '素食',
    duration: '3分钟',
    difficulty: '简单',
    ingredients: [
      { name: '豆苗', amount: '1把', isSeasoning: false },
      { name: '大蒜', amount: '2瓣', isSeasoning: true },
      { name: '盐', amount: '少许', isSeasoning: true }
    ],
    steps: ['爆香蒜片', '下豆苗大火快炒1分钟', '加盐出锅']
  },
  {
    name: '小炒黄牛肉',
    keywords: ['湘味牛肉', '辣椒炒牛肉', '下饭菜'],
    category: '肉类',
    duration: '10分钟',
    difficulty: '中等',
    ingredients: [
      { name: '黄牛肉', amount: '200g', isSeasoning: false },
      { name: '青椒', amount: '2个', isSeasoning: false },
      { name: '小米辣', amount: '2个', isSeasoning: true },
      { name: '生抽', amount: '1勺', isSeasoning: true },
      { name: '料酒', amount: '1勺', isSeasoning: true }
    ],
    steps: ['牛肉切薄片腌制', '大火快炒至变色盛出', '炒香辣椒，倒回牛肉快速翻炒出锅']
  },
  {
    name: '辣椒炒肉',
    keywords: ['农家小炒肉', '青椒炒肉', '湘菜'],
    category: '肉类',
    duration: '15分钟',
    difficulty: '简单',
    ingredients: [
      { name: '五花肉', amount: '150g', isSeasoning: false },
      { name: '青椒', amount: '3个', isSeasoning: false },
      { name: '大蒜', amount: '2瓣', isSeasoning: true },
      { name: '盐', amount: '适量', isSeasoning: true }
    ],
    steps: ['五花肉煸出油', '下青椒炒至断生', '混合调味翻炒']
  },
  {
    name: '香干炒肉',
    keywords: ['豆腐干炒肉', '香干肉丝', '家常菜'],
    category: '家常菜',
    duration: '12分钟',
    difficulty: '简单',
    ingredients: [
      { name: '香干', amount: '4块', isSeasoning: false },
      { name: '猪肉', amount: '150g', isSeasoning: false },
      { name: '青椒', amount: '1个', isSeasoning: false },
      { name: '生抽', amount: '1勺', isSeasoning: true }
    ],
    steps: ['肉片炒熟', '香干煎至微黄', '混合翻炒调味']
  },
  {
    name: '芹菜炒香干',
    keywords: ['芹菜香干', '素菜', '清淡菜'],
    category: '素食',
    duration: '10分钟',
    difficulty: '简单',
    ingredients: [
      { name: '芹菜', amount: '1小把', isSeasoning: false },
      { name: '香干', amount: '3块', isSeasoning: false },
      { name: '盐', amount: '适量', isSeasoning: true }
    ],
    steps: ['芹菜切段焯水', '香干煎香', '混合翻炒调味']
  },
  {
    name: '土豆炖牛肉',
    keywords: ['牛肉炖土豆', '红烧牛肉', '炖菜'],
    category: '肉类',
    duration: '60分钟',
    difficulty: '困难',
    ingredients: [
      { name: '牛腩', amount: '500g', isSeasoning: false },
      { name: '土豆', amount: '2个', isSeasoning: false },
      { name: '八角', amount: '2个', isSeasoning: true },
      { name: '姜片', amount: '3片', isSeasoning: true },
      { name: '生抽', amount: '1勺', isSeasoning: true }
    ],
    steps: ['牛肉焯水', '炒香调料和牛肉', '加水炖40分钟', '加土豆再炖20分钟']
  },
  {
    name: '萝卜炖排骨',
    keywords: ['白萝卜排骨', '排骨汤', '清炖'],
    category: '汤品',
    duration: '50分钟',
    difficulty: '中等',
    ingredients: [
      { name: '排骨', amount: '500g', isSeasoning: false },
      { name: '白萝卜', amount: '1根', isSeasoning: false },
      { name: '姜片', amount: '3片', isSeasoning: true },
      { name: '盐', amount: '适量', isSeasoning: true }
    ],
    steps: ['排骨焯水', '加水、姜片炖30分钟', '加萝卜炖20分钟', '加盐调味']
  },
  {
    name: '小鸡炖蘑菇',
    keywords: ['东北炖鸡', '蘑菇炖鸡', '炖菜'],
    category: '肉类',
    duration: '60分钟',
    difficulty: '中等',
    ingredients: [
      { name: '三黄鸡', amount: '半只', isSeasoning: false },
      { name: '干榛蘑', amount: '1把', isSeasoning: false },
      { name: '姜片', amount: '3片', isSeasoning: true },
      { name: '八角', amount: '1个', isSeasoning: true }
    ],
    steps: ['鸡肉焯水', '炒香后加水炖30分钟', '加蘑菇炖30分钟']
  },
  {
    name: '冬瓜炖鸭肉',
    keywords: ['冬瓜老鸭汤', '鸭肉炖冬瓜', '汤品'],
    category: '汤品',
    duration: '50分钟',
    difficulty: '中等',
    ingredients: [
      { name: '鸭肉', amount: '400g', isSeasoning: false },
      { name: '冬瓜', amount: '300g', isSeasoning: false },
      { name: '姜片', amount: '3片', isSeasoning: true },
      { name: '盐', amount: '适量', isSeasoning: true }
    ],
    steps: ['鸭肉焯水', '炖30分钟', '加冬瓜炖15分钟调味']
  },
  {
    name: '黄豆炖猪蹄',
    keywords: ['猪蹄炖黄豆', '美容养颜', '炖菜'],
    category: '肉类',
    duration: '90分钟',
    difficulty: '困难',
    ingredients: [
      { name: '猪蹄', amount: '500g', isSeasoning: false },
      { name: '干黄豆', amount: '1把', isSeasoning: false },
      { name: '姜片', amount: '3片', isSeasoning: true },
      { name: '八角', amount: '2个', isSeasoning: true }
    ],
    steps: ['猪蹄焯水', '黄豆泡发', '一起炖90分钟至软烂']
  },
  {
    name: '玉米排骨汤',
    keywords: ['甜玉米排骨', '清淡汤品', '养生汤'],
    category: '汤品',
    duration: '40分钟',
    difficulty: '简单',
    ingredients: [
      { name: '排骨', amount: '400g', isSeasoning: false },
      { name: '甜玉米', amount: '1根', isSeasoning: false },
      { name: '胡萝卜', amount: '半根', isSeasoning: false },
      { name: '盐', amount: '适量', isSeasoning: true }
    ],
    steps: ['排骨焯水', '加玉米、胡萝卜炖30分钟', '加盐调味']
  },
  {
    name: '番茄牛腩汤',
    keywords: ['西红柿牛腩', '番茄牛肉汤', '浓汤'],
    category: '汤品',
    duration: '60分钟',
    difficulty: '中等',
    ingredients: [
      { name: '牛腩', amount: '400g', isSeasoning: false },
      { name: '番茄', amount: '3个', isSeasoning: false },
      { name: '姜片', amount: '3片', isSeasoning: true },
      { name: '盐', amount: '适量', isSeasoning: true }
    ],
    steps: ['牛腩焯水炖40分钟', '番茄炒出汁', '混合炖10分钟调味']
  },
  {
    name: '酸菜鱼',
    keywords: ['酸汤鱼', '酸菜鱼片', '川菜'],
    category: '肉类',
    duration: '30分钟',
    difficulty: '中等',
    ingredients: [
      { name: '草鱼/黑鱼', amount: '500g', isSeasoning: false },
      { name: '酸菜', amount: '200g', isSeasoning: false },
      { name: '姜片', amount: '3片', isSeasoning: true },
      { name: '干辣椒', amount: '3个', isSeasoning: true }
    ],
    steps: ['鱼片腌制', '炒香酸菜加水煮沸', '下鱼片煮至变白']
  },
  {
    name: '水煮肉片',
    keywords: ['麻辣水煮肉', '川菜', '下饭菜'],
    category: '肉类',
    duration: '25分钟',
    difficulty: '中等',
    ingredients: [
      { name: '猪里脊', amount: '300g', isSeasoning: false },
      { name: '豆芽', amount: '1把', isSeasoning: false },
      { name: '郫县豆瓣酱', amount: '1勺', isSeasoning: true },
      { name: '花椒', amount: '少许', isSeasoning: true }
    ],
    steps: ['肉片腌制，豆芽焯水铺底', '炒底料加水煮沸', '下肉片煮熟，淋热油激香花椒']
  },
  {
    name: '水煮鱼',
    keywords: ['麻辣鱼', '水煮鱼片', '川菜'],
    category: '肉类',
    duration: '30分钟',
    difficulty: '中等',
    ingredients: [
      { name: '草鱼', amount: '500g', isSeasoning: false },
      { name: '豆芽', amount: '1把', isSeasoning: false },
      { name: '豆瓣酱', amount: '1勺', isSeasoning: true },
      { name: '花椒干辣椒', amount: '适量', isSeasoning: true }
    ],
    steps: ['鱼片腌制', '炒底料煮汤', '煮鱼片，淋热油']
  },
  {
    name: '毛血旺',
    keywords: ['血旺', '川味杂烩', '麻辣'],
    category: '肉类',
    duration: '25分钟',
    difficulty: '中等',
    ingredients: [
      { name: '鸭血', amount: '1盒', isSeasoning: false },
      { name: '毛肚', amount: '100g', isSeasoning: false },
      { name: '黄喉', amount: '50g', isSeasoning: false },
      { name: '豆芽', amount: '1把', isSeasoning: false },
      { name: '豆瓣酱', amount: '1勺', isSeasoning: true }
    ],
    steps: ['食材焯水铺底', '炒麻辣汤底煮沸淋入', '泼热油激香']
  },
  {
    name: '辣子鸡',
    keywords: ['重庆辣子鸡', '麻辣鸡丁', '川菜'],
    category: '肉类',
    duration: '20分钟',
    difficulty: '中等',
    ingredients: [
      { name: '鸡腿肉', amount: '300g', isSeasoning: false },
      { name: '干辣椒', amount: '1把', isSeasoning: true },
      { name: '花椒', amount: '1勺', isSeasoning: true },
      { name: '盐', amount: '适量', isSeasoning: true }
    ],
    steps: ['鸡肉切丁腌制炸至金黄', '炒香辣椒花椒', '混合翻炒入味']
  },
  {
    name: '啤酒鸭',
    keywords: ['啤酒焖鸭', '鸭肉', '下饭菜'],
    category: '肉类',
    duration: '40分钟',
    difficulty: '中等',
    ingredients: [
      { name: '鸭肉', amount: '500g', isSeasoning: false },
      { name: '啤酒', amount: '1罐', isSeasoning: false },
      { name: '姜片', amount: '3片', isSeasoning: true },
      { name: '八角', amount: '1个', isSeasoning: true }
    ],
    steps: ['鸭肉焯水煸干水分', '加啤酒和调料炖35分钟']
  },
  {
    name: '红烧鸡块',
    keywords: ['红烧鸡肉', '鸡块', '家常菜'],
    category: '肉类',
    duration: '30分钟',
    difficulty: '简单',
    ingredients: [
      { name: '鸡腿块', amount: '500g', isSeasoning: false },
      { name: '冰糖', amount: '1勺', isSeasoning: true },
      { name: '生抽', amount: '1勺', isSeasoning: true },
      { name: '姜片', amount: '3片', isSeasoning: true }
    ],
    steps: ['鸡块焯水', '炒糖色翻炒上色', '加水焖煮25分钟']
  },
  {
    name: '蒜香鸡翅',
    keywords: ['蒜蓉鸡翅', '香煎鸡翅', '快手菜'],
    category: '快手菜',
    duration: '25分钟',
    difficulty: '简单',
    ingredients: [
      { name: '鸡翅中', amount: '8个', isSeasoning: false },
      { name: '大蒜', amount: '1头', isSeasoning: true },
      { name: '生抽', amount: '1勺', isSeasoning: true },
      { name: '盐', amount: '少许', isSeasoning: true }
    ],
    steps: ['鸡翅腌制', '煎至两面金黄', '加蒜末炒香焖煮']
  },
  {
    name: '咖喱鸡肉',
    keywords: ['咖喱鸡', '日式咖喱', '下饭'],
    category: '家常菜',
    duration: '25分钟',
    difficulty: '简单',
    ingredients: [
      { name: '鸡腿肉', amount: '300g', isSeasoning: false },
      { name: '土豆', amount: '1个', isSeasoning: false },
      { name: '胡萝卜', amount: '半根', isSeasoning: false },
      { name: '咖喱块', amount: '3块', isSeasoning: true }
    ],
    steps: ['鸡肉炒至变色', '加蔬菜翻炒', '加水煮沸放咖喱，焖煮至浓稠']
  },
  {
    name: '葱爆羊肉',
    keywords: ['大葱羊肉', '快手羊肉', '北方菜'],
    category: '肉类',
    duration: '8分钟',
    difficulty: '简单',
    ingredients: [
      { name: '羊肉片', amount: '200g', isSeasoning: false },
      { name: '大葱', amount: '1根', isSeasoning: false },
      { name: '生抽', amount: '1勺', isSeasoning: true },
      { name: '料酒', amount: '1勺', isSeasoning: true }
    ],
    steps: ['大葱爆香', '下羊肉大火快炒至变色', '调味出锅']
  },
  {
    name: '孜然牛肉',
    keywords: ['孜然炒牛肉', '烧烤味', '下饭菜'],
    category: '肉类',
    duration: '10分钟',
    difficulty: '简单',
    ingredients: [
      { name: '牛里脊', amount: '200g', isSeasoning: false },
      { name: '孜然粉', amount: '1勺', isSeasoning: true },
      { name: '辣椒面', amount: '半勺', isSeasoning: true },
      { name: '生抽', amount: '1勺', isSeasoning: true }
    ],
    steps: ['牛肉腌制滑炒至变色', '撒孜然辣椒面翻炒']
  },
  {
    name: '蚝油牛肉',
    keywords: ['滑蛋牛肉', '蚝油炒牛肉', '粤菜'],
    category: '肉类',
    duration: '10分钟',
    difficulty: '中等',
    ingredients: [
      { name: '牛里脊', amount: '200g', isSeasoning: false },
      { name: '蚝油', amount: '1勺', isSeasoning: true },
      { name: '淀粉', amount: '少许', isSeasoning: true },
      { name: '生抽', amount: '半勺', isSeasoning: true }
    ],
    steps: ['牛肉用淀粉蚝油腌制', '大火滑炒至变色立即出锅']
  },
  {
    name: '滑蛋虾仁',
    keywords: ['虾仁炒蛋', '粤菜', '清淡'],
    category: '海鲜',
    duration: '10分钟',
    difficulty: '简单',
    ingredients: [
      { name: '鲜虾仁', amount: '150g', isSeasoning: false },
      { name: '鸡蛋', amount: '3个', isSeasoning: false },
      { name: '盐', amount: '少许', isSeasoning: true },
      { name: '水淀粉', amount: '少许', isSeasoning: true }
    ],
    steps: ['虾仁腌制炒熟', '鸡蛋液加淀粉搅匀', '小火炒至半熟加虾仁']
  },
  {
    name: '蒜蓉蒸虾',
    keywords: ['蒸虾', '蒜蓉粉丝虾', '海鲜'],
    category: '海鲜',
    duration: '10分钟',
    difficulty: '简单',
    ingredients: [
      { name: '大虾', amount: '10只', isSeasoning: false },
      { name: '大蒜', amount: '1头', isSeasoning: true },
      { name: '粉丝', amount: '1把', isSeasoning: false },
      { name: '生抽', amount: '1勺', isSeasoning: true }
    ],
    steps: ['粉丝铺底，虾开背摆放', '铺上蒜蓉，水蒸8分钟', '淋生抽，泼热油']
  },
  {
    name: '清蒸鲈鱼',
    keywords: ['清蒸鱼', '鲈鱼', '清淡海鲜'],
    category: '海鲜',
    duration: '12分钟',
    difficulty: '简单',
    ingredients: [
      { name: '鲈鱼', amount: '1条(500g)', isSeasoning: false },
      { name: '姜片', amount: '3片', isSeasoning: true },
      { name: '葱丝', amount: '少许', isSeasoning: true },
      { name: '蒸鱼豉油', amount: '1勺', isSeasoning: true }
    ],
    steps: ['鱼处理干净铺姜片', '水蒸10分钟', '淋豉油，撒葱丝泼热油']
  },
  {
    name: '红烧带鱼',
    keywords: ['烧带鱼', '带鱼', '海鲜'],
    category: '海鲜',
    duration: '20分钟',
    difficulty: '简单',
    ingredients: [
      { name: '带鱼段', amount: '300g', isSeasoning: false },
      { name: '生抽', amount: '1勺', isSeasoning: true },
      { name: '老抽', amount: '半勺', isSeasoning: true },
      { name: '姜片', amount: '3片', isSeasoning: true }
    ],
    steps: ['带鱼煎至两面金黄', '加调料和水焖煮10分钟']
  },
  {
    name: '干煎小黄鱼',
    keywords: ['煎黄花鱼', '海鲜', '快手菜'],
    category: '海鲜',
    duration: '10分钟',
    difficulty: '简单',
    ingredients: [
      { name: '小黄鱼', amount: '4条', isSeasoning: false },
      { name: '盐', amount: '适量', isSeasoning: true },
      { name: '姜片', amount: '2片', isSeasoning: true }
    ],
    steps: ['鱼腌制擦干', '小火煎至两面金黄酥脆']
  },
  {
    name: '酱烧鲤鱼',
    keywords: ['红烧鲤鱼', '酱烧鱼', '河鲜'],
    category: '海鲜',
    duration: '25分钟',
    difficulty: '中等',
    ingredients: [
      { name: '鲤鱼', amount: '1条', isSeasoning: false },
      { name: '甜面酱', amount: '1勺', isSeasoning: true },
      { name: '生抽', amount: '1勺', isSeasoning: true },
      { name: '姜片', amount: '3片', isSeasoning: true }
    ],
    steps: ['鱼煎至金黄', '炒香酱料加水焖煮15分钟']
  },
  {
    name: '剁椒鱼头',
    keywords: ['剁椒鱼', '川菜', '蒸菜'],
    category: '海鲜',
    duration: '20分钟',
    difficulty: '中等',
    ingredients: [
      { name: '胖头鱼头', amount: '1个', isSeasoning: false },
      { name: '剁椒', amount: '3勺', isSeasoning: true },
      { name: '姜片', amount: '3片', isSeasoning: true },
      { name: '葱花', amount: '少许', isSeasoning: true }
    ],
    steps: ['鱼头铺剁椒和姜片', '水蒸18分钟', '撒葱花泼热油']
  },
  {
    name: '蒜蓉粉丝蒸扇贝',
    keywords: ['蒸扇贝', '蒜蓉海鲜', '扇贝'],
    category: '海鲜',
    duration: '8分钟',
    difficulty: '简单',
    ingredients: [
      { name: '扇贝', amount: '6个', isSeasoning: false },
      { name: '粉丝', amount: '1把', isSeasoning: false },
      { name: '大蒜', amount: '1头', isSeasoning: true },
      { name: '生抽', amount: '1勺', isSeasoning: true }
    ],
    steps: ['粉丝铺底，放扇贝肉', '铺蒜蓉蒸6分钟', '淋生抽泼热油']
  },
  {
    name: '爆炒花蛤',
    keywords: ['炒花甲', '麻辣花蛤', '海鲜'],
    category: '海鲜',
    duration: '8分钟',
    difficulty: '简单',
    ingredients: [
      { name: '花蛤', amount: '500g', isSeasoning: false },
      { name: '干辣椒', amount: '3个', isSeasoning: true },
      { name: '大蒜', amount: '3瓣', isSeasoning: true },
      { name: '生抽', amount: '1勺', isSeasoning: true }
    ],
    steps: ['花蛤吐沙洗净', '爆香调料，下花蛤大火炒至开口']
  },
  {
    name: '葱姜炒蟹',
    keywords: ['炒大闸蟹', '葱姜蟹', '海鲜'],
    category: '海鲜',
    duration: '15分钟',
    difficulty: '中等',
    ingredients: [
      { name: '螃蟹', amount: '2只', isSeasoning: false },
      { name: '大葱', amount: '1根', isSeasoning: false },
      { name: '生姜', amount: '1块', isSeasoning: true },
      { name: '料酒', amount: '1勺', isSeasoning: true }
    ],
    steps: ['螃蟹处理干净切块', '爆香葱姜，下蟹炒至变红熟透']
  },
  {
    name: '韭菜炒河虾',
    keywords: ['河虾韭菜', '小河虾', '下饭菜'],
    category: '海鲜',
    duration: '8分钟',
    difficulty: '简单',
    ingredients: [
      { name: '小河虾', amount: '200g', isSeasoning: false },
      { name: '韭菜', amount: '1小把', isSeasoning: false },
      { name: '盐', amount: '适量', isSeasoning: true }
    ],
    steps: ['河虾炒至变红', '下韭菜快炒调味']
  },
  {
    name: '西红柿炒虾仁',
    keywords: ['番茄虾仁', '清淡海鲜', '家常菜'],
    category: '海鲜',
    duration: '10分钟',
    difficulty: '简单',
    ingredients: [
      { name: '虾仁', amount: '150g', isSeasoning: false },
      { name: '西红柿', amount: '1个', isSeasoning: false },
      { name: '盐', amount: '少许', isSeasoning: true }
    ],
    steps: ['虾仁炒熟', '西红柿炒出汁', '混合翻炒调味']
  },
  {
    name: '肉末蒸蛋',
    keywords: ['肉沫蒸蛋', '蒸菜', '下饭菜'],
    category: '家常菜',
    duration: '15分钟',
    difficulty: '简单',
    ingredients: [
      { name: '鸡蛋', amount: '3个', isSeasoning: false },
      { name: '猪肉末', amount: '100g', isSeasoning: false },
      { name: '生抽', amount: '1勺', isSeasoning: true },
      { name: '盐', amount: '少许', isSeasoning: true }
    ],
    steps: ['鸡蛋加温水搅匀蒸8分钟', '肉末炒香铺在蛋上，再蒸2分钟']
  },
  {
    name: '虾仁蒸蛋',
    keywords: ['鲜虾蒸蛋', '嫩滑蒸蛋', '清淡'],
    category: '海鲜',
    duration: '12分钟',
    difficulty: '简单',
    ingredients: [
      { name: '鸡蛋', amount: '3个', isSeasoning: false },
      { name: '鲜虾仁', amount: '6只', isSeasoning: false },
      { name: '盐', amount: '少许', isSeasoning: true }
    ],
    steps: ['蛋液过筛，蒸5分钟', '摆虾仁再蒸3分钟']
  },
  {
    name: '水蒸蛋',
    keywords: ['蒸鸡蛋羹', '嫩滑蒸蛋', '快手菜'],
    category: '家常菜',
    duration: '10分钟',
    difficulty: '简单',
    ingredients: [
      { name: '鸡蛋', amount: '3个', isSeasoning: false },
      { name: '温水', amount: '适量', isSeasoning: false },
      { name: '盐', amount: '少许', isSeasoning: true },
      { name: '生抽', amount: '半勺', isSeasoning: true }
    ],
    steps: ['蛋液加温水搅匀过筛', '水蒸10分钟，淋生抽']
  },
  {
    name: '虎皮鸡蛋',
    keywords: ['炸鸡蛋', '红烧鸡蛋', '素菜'],
    category: '素食',
    duration: '15分钟',
    difficulty: '简单',
    ingredients: [
      { name: '鸡蛋', amount: '4个', isSeasoning: false },
      { name: '生抽', amount: '1勺', isSeasoning: true },
      { name: '老抽', amount: '半勺', isSeasoning: true },
      { name: '辣椒', amount: '2个', isSeasoning: true }
    ],
    steps: ['鸡蛋煮熟炸至表皮起皱', '加调料焖煮入味']
  },
  {
    name: '西红柿蛋花汤',
    keywords: ['番茄蛋汤', '快手汤', '家常汤'],
    category: '汤品',
    duration: '5分钟',
    difficulty: '简单',
    ingredients: [
      { name: '西红柿', amount: '1个', isSeasoning: false },
      { name: '鸡蛋', amount: '1个', isSeasoning: false },
      { name: '盐', amount: '少许', isSeasoning: true }
    ],
    steps: ['西红柿炒出汁加水煮沸', '淋蛋液，加盐调味']
  },
  {
    name: '菠菜猪肝汤',
    keywords: ['猪肝汤', '补血汤', '养生汤'],
    category: '汤品',
    duration: '10分钟',
    difficulty: '简单',
    ingredients: [
      { name: '猪肝', amount: '100g', isSeasoning: false },
      { name: '菠菜', amount: '1小把', isSeasoning: false },
      { name: '姜片', amount: '2片', isSeasoning: true },
      { name: '盐', amount: '少许', isSeasoning: true }
    ],
    steps: ['猪肝腌制', '水沸下猪肝煮至变色', '加菠菜煮沸调味']
  },
  {
    name: '酸辣汤',
    keywords: ['胡辣汤', '酸辣开胃', '快手汤'],
    category: '汤品',
    duration: '10分钟',
    difficulty: '简单',
    ingredients: [
      { name: '豆腐', amount: '少许', isSeasoning: false },
      { name: '木耳', amount: '少许', isSeasoning: false },
      { name: '鸡蛋', amount: '1个', isSeasoning: false },
      { name: '香醋', amount: '1勺', isSeasoning: true },
      { name: '胡椒粉', amount: '少许', isSeasoning: true }
    ],
    steps: ['食材切丝煮沸', '淋蛋液，加醋和胡椒粉']
  },
  {
    name: '疙瘩汤',
    keywords: ['面疙瘩汤', '家常汤', '主食汤'],
    category: '汤品',
    duration: '15分钟',
    difficulty: '简单',
    ingredients: [
      { name: '面粉', amount: '100g', isSeasoning: false },
      { name: '西红柿', amount: '1个', isSeasoning: false },
      { name: '鸡蛋', amount: '1个', isSeasoning: false },
      { name: '盐', amount: '少许', isSeasoning: true }
    ],
    steps: ['面粉搅成小面疙瘩', '西红柿炒出汁加水煮沸', '下疙瘩煮熟，淋蛋液']
  },
  {
    name: '冬瓜丸子汤',
    keywords: ['肉丸冬瓜汤', '清淡汤', '家常汤'],
    category: '汤品',
    duration: '15分钟',
    difficulty: '简单',
    ingredients: [
      { name: '猪肉末', amount: '150g', isSeasoning: false },
      { name: '冬瓜', amount: '200g', isSeasoning: false },
      { name: '姜片', amount: '2片', isSeasoning: true },
      { name: '盐', amount: '适量', isSeasoning: true }
    ],
    steps: ['肉末搓成丸子', '水沸下丸子煮至浮起', '加冬瓜煮10分钟']
  },
  {
    name: '清炒土豆片',
    keywords: ['炒土豆', '土豆片', '快手菜'],
    category: '素食',
    duration: '8分钟',
    difficulty: '简单',
    ingredients: [
      { name: '土豆', amount: '1个', isSeasoning: false },
      { name: '大蒜', amount: '2瓣', isSeasoning: true },
      { name: '盐', amount: '少许', isSeasoning: true }
    ],
    steps: ['土豆切片泡水去淀粉', '大火快炒至熟透调味']
  },
  {
    name: '酸辣藕丁',
    keywords: ['炒藕丁', '酸辣藕', '素菜'],
    category: '素食',
    duration: '8分钟',
    difficulty: '简单',
    ingredients: [
      { name: '莲藕', amount: '1节', isSeasoning: false },
      { name: '香醋', amount: '1勺', isSeasoning: true },
      { name: '干辣椒', amount: '2个', isSeasoning: true },
      { name: '盐', amount: '少许', isSeasoning: true }
    ],
    steps: ['藕丁焯水', '爆香辣椒翻炒', '加醋盐调味']
  },
  {
    name: '凉拌木耳',
    keywords: ['黑木耳', '凉拌菜', '爽口'],
    category: '素食',
    duration: '10分钟',
    difficulty: '简单',
    ingredients: [
      { name: '干木耳', amount: '1把', isSeasoning: false },
      { name: '大蒜', amount: '2瓣', isSeasoning: true },
      { name: '香醋', amount: '1勺', isSeasoning: true },
      { name: '生抽', amount: '半勺', isSeasoning: true }
    ],
    steps: ['木耳泡发焯水', '加调料拌匀']
  },
  {
    name: '皮蛋豆腐',
    keywords: ['凉拌豆腐', '皮蛋拌豆腐', '冷菜'],
    category: '素食',
    duration: '5分钟',
    difficulty: '简单',
    ingredients: [
      { name: '嫩豆腐', amount: '1盒', isSeasoning: false },
      { name: '皮蛋', amount: '2个', isSeasoning: false },
      { name: '生抽', amount: '1勺', isSeasoning: true },
      { name: '葱花', amount: '少许', isSeasoning: true }
    ],
    steps: ['豆腐切块，皮蛋切丁', '淋生抽，撒葱花']
  },
  {
    name: '拍黄瓜',
    keywords: ['凉拌黄瓜', '爽口黄瓜', '冷菜'],
    category: '素食',
    duration: '5分钟',
    difficulty: '简单',
    ingredients: [
      { name: '黄瓜', amount: '2根', isSeasoning: false },
      { name: '大蒜', amount: '2瓣', isSeasoning: true },
      { name: '香醋', amount: '1勺', isSeasoning: true },
      { name: '盐', amount: '少许', isSeasoning: true }
    ],
    steps: ['黄瓜拍碎', '加调料拌匀']
  },
  {
    name: '老醋花生',
    keywords: ['醋泡花生', '凉拌花生', '下酒菜'],
    category: '素食',
    duration: '10分钟',
    difficulty: '简单',
    ingredients: [
      { name: '花生米', amount: '100g', isSeasoning: false },
      { name: '老醋', amount: '2勺', isSeasoning: true },
      { name: '白糖', amount: '1勺', isSeasoning: true }
    ],
    steps: ['花生米炸熟放凉', '加糖醋汁拌匀']
  },
  {
    name: '凉拌海带丝',
    keywords: ['海带', '凉拌菜', '爽口'],
    category: '素食',
    duration: '5分钟',
    difficulty: '简单',
    ingredients: [
      { name: '海带丝', amount: '1把', isSeasoning: false },
      { name: '大蒜', amount: '2瓣', isSeasoning: true },
      { name: '香醋', amount: '1勺', isSeasoning: true },
      { name: '盐', amount: '少许', isSeasoning: true }
    ],
    steps: ['海带丝焯水', '加调料拌匀']
  },
  {
    name: '蒜泥白肉',
    keywords: ['白切肉', '凉拌肉', '川菜'],
    category: '肉类',
    duration: '15分钟',
    difficulty: '简单',
    ingredients: [
      { name: '五花肉', amount: '200g', isSeasoning: false },
      { name: '大蒜', amount: '5瓣', isSeasoning: true },
      { name: '辣椒油', amount: '1勺', isSeasoning: true },
      { name: '生抽', amount: '1勺', isSeasoning: true }
    ],
    steps: ['五花肉煮熟切片', '淋蒜泥辣椒油拌匀']
  },
  {
    name: '口水鸡',
    keywords: ['麻辣鸡', '凉拌鸡', '川菜'],
    category: '肉类',
    duration: '20分钟',
    difficulty: '中等',
    ingredients: [
      { name: '鸡腿', amount: '2个', isSeasoning: false },
      { name: '辣椒油', amount: '1勺', isSeasoning: true },
      { name: '蒜末', amount: '少许', isSeasoning: true },
      { name: '生抽', amount: '1勺', isSeasoning: true }
    ],
    steps: ['鸡腿煮熟撕成丝', '淋麻辣料汁拌匀']
  },
  {
    name: '红油耳丝',
    keywords: ['凉拌猪耳朵', '红油耳片', '冷菜'],
    category: '肉类',
    duration: '15分钟',
    difficulty: '简单',
    ingredients: [
      { name: '猪耳朵', amount: '1个', isSeasoning: false },
      { name: '红油', amount: '1勺', isSeasoning: true },
      { name: '大蒜', amount: '2瓣', isSeasoning: true },
      { name: '盐', amount: '少许', isSeasoning: true }
    ],
    steps: ['猪耳朵煮熟切丝', '加调料拌匀']
  },
  {
    name: '炝拌土豆丝',
    keywords: ['凉拌土豆丝', '酸辣土豆丝', '冷菜'],
    category: '素食',
    duration: '10分钟',
    difficulty: '简单',
    ingredients: [
      { name: '土豆', amount: '1个', isSeasoning: false },
      { name: '香醋', amount: '1勺', isSeasoning: true },
      { name: '干辣椒', amount: '2个', isSeasoning: true },
      { name: '盐', amount: '少许', isSeasoning: true }
    ],
    steps: ['土豆丝焯水过凉', '泼热油炝香辣椒，拌匀调味']
  },
  {
    name: '糖拌西红柿',
    keywords: ['凉拌西红柿', '白糖番茄', '甜品'],
    category: '素食',
    duration: '5分钟',
    difficulty: '简单',
    ingredients: [
      { name: '西红柿', amount: '2个', isSeasoning: false },
      { name: '白糖', amount: '2勺', isSeasoning: true }
    ],
    steps: ['西红柿切块', '撒白糖拌匀']
  },
  {
    name: '蔬菜沙拉',
    keywords: ['沙拉', '生菜沙拉', '清淡'],
    category: '素食',
    duration: '5分钟',
    difficulty: '简单',
    ingredients: [
      { name: '生菜', amount: '1片', isSeasoning: false },
      { name: '黄瓜', amount: '少许', isSeasoning: false },
      { name: '圣女果', amount: '几颗', isSeasoning: false },
      { name: '沙拉酱', amount: '1勺', isSeasoning: true }
    ],
    steps: ['蔬菜洗净沥干', '加沙拉酱拌匀']
  },
  {
    name: '炒合菜',
    keywords: ['合菜', '韭菜鸡蛋炒粉丝', '家常菜'],
    category: '家常菜',
    duration: '10分钟',
    difficulty: '简单',
    ingredients: [
      { name: '韭菜', amount: '1小把', isSeasoning: false },
      { name: '鸡蛋', amount: '2个', isSeasoning: false },
      { name: '粉丝', amount: '1把', isSeasoning: false },
      { name: '豆芽', amount: '1把', isSeasoning: false },
      { name: '盐', amount: '适量', isSeasoning: true }
    ],
    steps: ['鸡蛋炒熟', '粉丝泡软', '所有食材大火快炒调味']
  },
  {
    name: '蚂蚁上树',
    keywords: ['肉末粉丝', '川菜', '下饭菜'],
    category: '家常菜',
    duration: '10分钟',
    difficulty: '简单',
    ingredients: [
      { name: '粉丝', amount: '1把', isSeasoning: false },
      { name: '猪肉末', amount: '100g', isSeasoning: false },
      { name: '豆瓣酱', amount: '半勺', isSeasoning: true },
      { name: '生抽', amount: '1勺', isSeasoning: true }
    ],
    steps: ['肉末炒香', '加豆瓣酱和水', '下粉丝煮至入味']
  },
  {
    name: '干锅花菜',
    keywords: ['干煸花菜', '湘味花菜', '干锅菜'],
    category: '素食',
    duration: '15分钟',
    difficulty: '简单',
    ingredients: [
      { name: '花菜', amount: '小半颗', isSeasoning: false },
      { name: '五花肉', amount: '50g', isSeasoning: false },
      { name: '大蒜', amount: '2瓣', isSeasoning: true },
      { name: '干辣椒', amount: '2个', isSeasoning: true }
    ],
    steps: ['花菜焯水', '五花肉煸出油', '加花菜大火翻炒调味']
  },
  {
    name: '干锅土豆片',
    keywords: ['干煸土豆', '干锅土豆', '素菜'],
    category: '素食',
    duration: '15分钟',
    difficulty: '简单',
    ingredients: [
      { name: '土豆', amount: '2个', isSeasoning: false },
      { name: '干辣椒', amount: '3个', isSeasoning: true },
      { name: '孜然粉', amount: '少许', isSeasoning: true },
      { name: '盐', amount: '适量', isSeasoning: true }
    ],
    steps: ['土豆片煎至金黄', '加调料大火翻炒入味']
  }
];