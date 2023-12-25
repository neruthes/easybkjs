// node examples/gamecorp-zh.js > examples/gamecorp-zh.html

const easybkjs = require('../src/easybkjs.js');

var myBook = easybkjs.create({
    symbol: '$'
});


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
        '本期利润': 0,
        '短期债务': 0,
        '长期债务': 0,
        '年终奖池': 0,
        '计提应急准备金': 0,
        '应付账款': 0,
        '@所有者权益': 0
    }
});


console.log(`<style>
table { padding: 20px 0px; }
table td { padding: 2px 6px; }
</style>`);





easybkjs.html_tag('h1', 'Some Video Game Corporation');

easybkjs.html_tag('h2', '2020 Q1');
easybkjs.html_tag('h3', '2020 JAN');
easybkjs.html_table_header();

myBook.date('2020-01-01');
myBook.expand('存款', '@所有者权益', 10000, '公司成立');
myBook.transferA('存款', '现金', 25, '银行取现');

myBook.date('2020-01-22');
myBook.shrink('存款', '@所有者权益', -1000, '工资，Alice');
myBook.shrink('存款', '@所有者权益', -1100, '工资，Bob');
myBook.cashOut(2100);

myBook.date('2020-02-22');
myBook.shrink('存款', '@所有者权益', -1000, '工资，Alice');
myBook.shrink('存款', '@所有者权益', -1100, '工资，Bob');
myBook.cashOut(2100);

myBook.date('2020-03-01');
myBook.expand('存款', '本期利润', 7148.51, 'Steam 平台分成，2020 年 01 月');
myBook.cashIn(7148.51);

easybkjs.html_table_footer();


myBook.date('2020-03-31');

myBook.dump({ format: 'html' });
myBook.dump({ format: 'json' });

myBook.cashDump();
myBook.cashflowReset();
