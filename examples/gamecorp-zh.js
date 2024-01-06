// node examples/gamecorp-zh.js > examples/gamecorp-zh.html
// Online demo: https://minio.neruthes.xyz/oss/keep/easybkjs/gamecorp-zh.html--b0b554119a1dfc14d21a6edeb7624ce8.html

const easybkjs = require('../src/easybkjs.js');

var myBook = easybkjs.create({
    symbol: '￥'
});

easybkjs.begin_document({ title: 'Some Video Game Corporation' });


myBook.import({
    assets: {
        '现金': 0,
        '存款': 0,
        '小金库': 0,
        '短期债权': 0,
        '长期债权': 0,
        '认缴注资': 0,
        '无形资产': 0,
        '固定资产': 0,
    },
    debts: {
        '资本': 0,
        '本期利润': 0,
        '短期债务': 0,
        '长期债务': 0,
        '年终奖池': 0,
        '计提应急准备金': 0,
        '应付账款': 0,
        '@所有者权益': 0
    }
});


easybkjs.default_css();
easybkjs.default_js();





easybkjs.html_tag('h1', 'Some Video Game Corporation');

easybkjs.html_tag('h2', '2020 Q1');

myBook.section('2020 JAN', function () {
    myBook.date('2020-01-01');
    myBook.expand('存款', '资本', 10000, '公司成立');
    myBook.transferA('存款', '现金', 25, '银行取现');

    myBook.date('2020-01-22');
    myBook.shrink('存款', '@所有者权益', -1000, '工资，Alice');
    myBook.shrink('存款', '@所有者权益', -1100, '工资，Bob');
    myBook.cashOut(2100);
});

myBook.section('2020 FEB', function () {
    myBook.date('2020-02-22');
    myBook.shrink('存款', '@所有者权益', -1000, '工资，Alice');
    myBook.shrink('存款', '@所有者权益', -1100, '工资，Bob');
    myBook.cashOut(2100);
});

myBook.section('2020 MAR', function () {
    myBook.date('2020-03-01');
    myBook.expand('存款', '本期利润', 88888, 'Steam 平台分成，2020 年 01 月，自研部门'); myBook.cashIn(88888);
    myBook.expand('存款', '应付账款', 23333, 'Steam 平台分成，2020 年 01 月，代理部门');
    myBook.date('2020-03-02');
    myBook.transferD('应付账款', '本期利润', 23333 * 0.3, '代理费收入，2020 年 01 月'); myBook.cashIn(23333 * 0.3);
    myBook.date('2020-03-05');
    myBook.shrink('存款', '应付账款', -(23333 - 23333 * 0.3), '向开发者结算代理分成');
    myBook.date('2020-03-06');
    myBook.transferA('存款', '小金库', 530, '凑票报销');
});






myBook.date('2020-03-31');

myBook.dump({ format: 'html' });
// myBook.dump({ format: 'json' });

myBook.cashDump();
myBook.cashflowReset();




easybkjs.end_document();

