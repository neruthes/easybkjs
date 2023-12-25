// node examples/gamecorp.js > examples/gamecorp.html

const easybkjs = require('../src/easybkjs.js');

var myBook = easybkjs.create({
    symbol: '$'
});


myBook.import({
    assets: {
        'Cash': 0,
        'Bank': 0,
        'Receivable': 0
    },
    debts: {
        'Payable': 0,
        'MainRevenue': 0,
        'Debt': 0,
        '@': 0 // Use '@' to represent owners equity!
    }
});


console.log(`<style>
table { padding: 20px 0px; }
table td { padding: 2px 4px; }
</style>`);





easybkjs.html_tag('h2', '2020 Q1');
easybkjs.html_tag('h3', '2020 JAN');
easybkjs.html_table_header();

myBook.date('2020-01-01');
myBook.expand('Bank', '@', 10000, 'Investment from the founders');
myBook.shrink('Cash', 'Debt', -100, 'Repay a debt');
myBook.transferA('Bank', 'Cash', 250, 'Withdraw cash');

easybkjs.html_table_footer();

myBook.date('2020-03-31');

myBook.dump({ format: 'html' });
myBook.dump({ format: 'json' });

