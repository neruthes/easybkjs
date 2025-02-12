function create(config) {
    return new the_real_constructor(config);
};

function html_tag(tag, content) {
    console.log(`<${tag}>${content}</${tag}>`);
}

function the_real_constructor(config) {
    this.config = config;
    this.ram = {
        cashflow: {
            main: {
                in: 0,
                out: 0
            }
        }
    };
};








the_real_constructor.prototype.date = function (dateStr) {
    // Set current date string
    this.ram.date = dateStr;
};
the_real_constructor.prototype.import = function (dataObj) {
    // const exampleObj = {
    //     assets: { 'Cash': 0, 'BankDeposit': 0, 'Receivable': 0 },
    //     debts: { 'Payable': 0, 'MainRevenue': 0, 'Debt': 0 }
    // };
    this.ram.current_balance_sheet = JSON.parse(JSON.stringify(dataObj));
    this.ram.subjectsA = Object.keys(dataObj.assets);
    this.ram.subjectsD = Object.keys(dataObj.debts);
};
the_real_constructor.prototype.queryA = function (fieldName) {
    return this.ram.current_balance_sheet.assets[fieldName];
};
the_real_constructor.prototype.queryD = function (fieldName) {
    return this.ram.current_balance_sheet.debts[fieldName];
};

function require_subject_field(bookObj, subjName, subjType) {
    // Throw error when subjName is not available
    if (bookObj.ram['subjects' + subjType].indexOf(subjName) === -1) {
        throw (new Error(`Cannot find subject <${subjName}> within the current account book!`));
    };
};

function render_sanitized_amount_str(amount_str, nums_render_style) {
    nums_render_style = nums_render_style || 'plain';
    // Supported styles: 
    //      plain               Verbatim output
    //      parentheses         Put negative values into a pair of parentheses
    //      compute             Call a custom anonymous function
    if (nums_render_style === 'plain') {
        return amount_str;
    };
    if (nums_render_style === 'compute') {
        return config.nums_render_function(amount_str);
    };
    if (nums_render_style === 'parentheses') {
        if (amount_str.indexOf('-') < 0) {
            return amount_str.replace('+', '');
        } else {
            return amount_str.replace('-', '(') + ')';
        };
    };
}

function sanitize_amount(amount, decimals) {
    // Check if the amount is more precise than the specified decimals
    const precision = Math.pow(10, decimals);
    if (Math.abs(Math.round(amount * precision) - amount * precision) > 0.1) {
        throw new Error(`Amount ${amount} exceeds the specified precision of ${decimals} decimal places.`);
    }

    // Convert the amount to a fixed number of decimal places
    const formattedAmount = amount.toFixed(decimals);

    // Add commas for thousands separators (NOT NOW)
    const parts = formattedAmount.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');


    const presign = amount > 0 ? '+' : '';

    // Join the parts and return the formatted amount
    return presign + parts.join('.');
}


function print_log_line(bookObj, operation, subj1, subj2, amount1, amount2, comment) {
    // Add other log formats in future?
    console.log(logline_formatters.html(bookObj, operation, subj1, subj2, amount1, amount2, comment));
};

const logline_formatters = {};
logline_formatters.html = function (bookObj, operation, subj1, subj2, amount1, amount2, comment) {
    // console.log(bookObj);
    return `<tr>
        <td class="tabular-nums">${bookObj.ram.date}</td>
        <td>${subj1}</td>
        <td class="col-amount tabular-nums">${render_sanitized_amount_str(sanitize_amount(amount1, 2), bookObj.config.nums_render_style)}</td>
        <td>${subj2}</td>
        <td class="col-amount tabular-nums">${render_sanitized_amount_str(sanitize_amount(amount2, 2), bookObj.config.nums_render_style)}</td>
        <td class="col-comment">${comment}</td>
    </tr>`;
}

the_real_constructor.prototype.expand = function (subjA, subjD, amount, comment, omit_log) {
    if (amount < 0) {
        throw new Error('Always give a positive number for expand amount!')
    };
    require_subject_field(this, subjA, 'A');
    require_subject_field(this, subjD, 'D');
    this.ram.current_balance_sheet.assets[subjA] += amount;
    this.ram.current_balance_sheet.debts[subjD] += amount;
    fix_balance_sheet_dict_float_precision(this);
    omit_log ? '' : print_log_line(this, 'Expand', subjA, subjD, amount, amount, comment);
};
the_real_constructor.prototype.shrink = function (subjA, subjD, amount, comment, omit_log) {
    if (amount > 0) {
        throw new Error('Always give a negative number for shrink amount!')
    };
    require_subject_field(this, subjA, 'A');
    require_subject_field(this, subjD, 'D');
    this.ram.current_balance_sheet.assets[subjA] += amount;
    this.ram.current_balance_sheet.debts[subjD] += amount;
    fix_balance_sheet_dict_float_precision(this);
    omit_log ? '' : print_log_line(this, 'Shrink', subjA, subjD, amount, amount, comment);
};
the_real_constructor.prototype.transferA = function (from, to, amount, comment, omit_log) {
    if (amount < 0) {
        throw new Error('Always give a positive number for transfer amount!')
    };
    require_subject_field(this, from, 'A');
    require_subject_field(this, to, 'A');
    this.ram.current_balance_sheet.assets[from] -= amount;
    this.ram.current_balance_sheet.assets[to] += amount;
    fix_balance_sheet_dict_float_precision(this);
    omit_log ? '' : print_log_line(this, 'TransferA', from, to, -amount, amount, comment);
};
the_real_constructor.prototype.transferD = function (from, to, amount, comment, omit_log) {
    if (amount < 0) {
        throw new Error('Always give a positive number for transfer amount!')
    };
    require_subject_field(this, from, 'D');
    require_subject_field(this, to, 'D');
    this.ram.current_balance_sheet.debts[from] -= amount;
    this.ram.current_balance_sheet.debts[to] += amount;
    fix_balance_sheet_dict_float_precision(this);
    omit_log ? '' : print_log_line(this, 'TransferD', from, to, -amount, amount, comment);
};

function fix_balance_sheet_dict_float_precision(bookObj) {
    ['assets', 'debts'].forEach(function (colName) {
        const dict = bookObj.ram.current_balance_sheet[colName];
        // console.error(dict);
        Object.keys(dict).forEach(function (key) {
            bookObj.ram.current_balance_sheet[colName][key] = clarify_ieee_float(dict[key]);
        });
    });
};





the_real_constructor.prototype.dump = function (options) {
    console.log(`<div><h3>Balance Sheet Snapshot ${this.ram.date}</h3></div>`);
    dump_formatters[options.format](this.ram.current_balance_sheet, this)
};

const dump_formatters = {};
dump_formatters.json = function (current_balance_sheet, bookObj) {
    console.log(`<pre>`);
    console.log(JSON.stringify(current_balance_sheet, '\t', 4))
    console.log(`</pre>`);
};
dump_formatters.html = function (current_balance_sheet, bookObj) {
    console.log(`<div>`); // Begin section
    console.log(`<div style="float: left;">
        <table>
        <tbody>
        <tr>
            <th>Assets</th>
            <th style="font-weight: bold; text-align: right;">(${bookObj.config.symbol})</th>
        </tr>
        ${Object.keys(current_balance_sheet.assets).map(key => `<tr><td>${key}</td><td class="col-amount tabular-nums">${sanitize_amount(clarify_ieee_float(current_balance_sheet.assets[key]), 2)
        }</td></tr>`).join('\n')}
        </tbody>
        </table>
    </div>`);
    console.log(`<div style="float: left; margin-left: 15px;">
        <table>
        <tbody>
        <tr>
            <th>Debts</th>
            <th style="font-weight: bold; text-align: right;">(${bookObj.config.symbol})</th>
        </tr>
        ${Object.keys(current_balance_sheet.debts).map(key => `<tr><td>${key}</td><td class="col-amount tabular-nums">${sanitize_amount(clarify_ieee_float(current_balance_sheet.debts[key]), 2)
        }</td></tr>`).join('\n')}
        </tbody>
        </table>
    </div>`);
    console.log(`<div style="clear: both;"></div>`);
    console.log(`</div>`); // End section
};
function clarify_ieee_float(num) {
    const precision = 10000;
    const output = Math.round(num * precision) / precision;
    // console.error(`clarify_ieee_float:  ${num} -> ${output}`);
    return output;
};






// And how do I track cashflow?
the_real_constructor.prototype.cashIn = function (amount, group) {
    group = group || 'main';
    this.ram.cashflow[group].in = clarify_ieee_float(this.ram.cashflow[group].in + amount)
};
the_real_constructor.prototype.cashOut = function (amount, group) {
    group = group || 'main';
    this.ram.cashflow[group].out = clarify_ieee_float(this.ram.cashflow[group].out + amount)
};
the_real_constructor.prototype.cashDump = function () {
    const print_cashflow_group_info_html = function (group, cash_in, cash_out, net_cash) {
        console.log(`<div>
            <h3>Cashflow group ${group}</h3>
            cash_in ${sanitize_amount(cash_in, 2)}<br>
            cash_out ${sanitize_amount(-cash_out, 2)}<br>
            net_cash ${sanitize_amount(net_cash, 2)}
        </div>`);
    };
    const groups = Object.keys(this.ram.cashflow);
    const cashflow_obj = this.ram.cashflow;
    groups.forEach(function (group) {
        const group_obj = cashflow_obj[group];
        print_cashflow_group_info_html(group, group_obj.in, group_obj.out, group_obj.in - group_obj.out);
    });
};
the_real_constructor.prototype.cashflowReset = function () { };



the_real_constructor.prototype.section = function (title, callback) {
    // Use this method to divide sections
    html_tag('h3', title);
    this.html_table_header();
    callback();
    this.html_table_footer();
};


the_real_constructor.prototype.html_table_footer = function () {
    console.log(`</tbody></table>`);
};
the_real_constructor.prototype.html_table_header = function () {
    console.log(`<table class="table-loglines"><tbody>`);
    console.log(`<tr style="font-weight: bold;">
        <th class="th-date">Date</th>
        <th class="th-subj1">Subj 1</th>
        <th class="th-value1">(${this.config.symbol})</th>
        <th class="th-subj2">Subj 2</th>
        <th class="th-value2">(${this.config.symbol})</th>
        <th class="th-comment">Comment</th>
    </tr>`);
};












module.exports = {
    create,
    html_tag,
    begin_document: function (options) {
        options = options || {
            title: 'Untitled Account Book'
        };
        console.log(`<!DOCTYPE html>
            <html>
            <head>
                <meta charset="utf-8" />
                <title>${options.title}</title>
            </head>
            <body>
            <div id="container" style="max-width: 1000px; padding: 15px; margin: 0 auto;">
        `);
    },
    end_document: function () {
        console.log(`<!DOCTYPE html>
            </div>
            </body>
            </html>
        `);
    },
    default_css: function () {
        console.log(`<style>
        html, body {
            font-size: 14px;
        }
        h1 { padding: 60px 0 30px; }
        h2 { border-bottom: 1px solid #999; padding: 10px 0 10px; margin: 40px 0 20px; }
        table th {
            text-align: left;
        }
        table.table-loglines { width: 100%; overflow: scroll; }
        th, td { padding: 3px 11px; }
        th.th-date { width: 7rem; }
        th.th-subj1, th.th-subj2 { width: 6.5rem; }
        th.th-value1, th.th-value2 { width: 5.5rem; text-align: right; }
        table, tr {
            border: 1px solid #999;
            border-collapse: collapse;
        }
        .tabular-nums { font-variant-numeric: tabular-nums; }
        td.col-comment { font-size: 0.8em; }
        td.col-amount { text-align: right; }
        td.col-amount.amount-negative { color: red; }
        </style>`);
    },
    default_js: function () {
        console.log(`<script>
        window.addEventListener('load', function () {
            document.querySelectorAll('table td.col-amount').forEach(function (td) {
                if (td.innerText[0] === '-') {
                    td.classList.add('amount-negative');
                };
            });
        });
        </script>`);
    },
}

