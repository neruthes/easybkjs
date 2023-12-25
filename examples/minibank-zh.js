// node examples/minibank-zh.js > examples/minibank-zh.html

const easybkjs = require('../src/easybkjs.js');

var myBook = easybkjs.create({
    symbol: '￥'
});

easybkjs.html_before_body();



myBook.import({
    assets: {
        '现金': 0,
        '同业头寸': 0,
        '短期债权': 0,
        '长期债权': 0,
        '认缴注资': 0,
        '无形资产': 0,
        '固定资产': 0,
        '应收账款': 0,
    },
    debts: {
        '储户.Alice': 0,
        '储户.Bob': 0,

        '本期利润': 0,
        '短期债务': 0,
        '长期债务': 0,
        '应付账款': 0,
        '@所有者权益': 0
    }
});


console.log(`<style>
table { padding: 20px 0px; }
table td { padding: 2px 6px; }
</style>`);





easybkjs.html_tag('h1', '某某钱庄');

easybkjs.html_tag('h2', '2020 Q1');
myBook.html_table_header();

myBook.date('2020-01-01');
myBook.expand('现金', '@所有者权益', 100, '钱庄成立');
myBook.expand('同业头寸', '储户.Alice', 1500, '存入 1500，Alice');
myBook.expand('同业头寸', '储户.Bob', 900, '存入 1500，Bob');

myBook.shrink('同业头寸', '储户.Alice', -1321.1, '支付，Alice：生活账单代缴');
myBook.shrink('同业头寸', '储户.Bob', -37.5, '支付，Bob：消费，淘宝代付');

myBook.html_table_footer();


myBook.date('2020-03-31');

myBook.dump({ format: 'html' });
myBook.dump({ format: 'json' });





easybkjs.html_after_body();

