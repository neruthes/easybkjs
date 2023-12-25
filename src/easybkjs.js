function create(config) {
    return new the_real_constructor(config);
};

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

function require_subject_field(bookObj, subjName, subjType) {
    // Throw error when subjName is not available
    if (bookObj.ram['subjects' + subjType].indexOf(subjName) === -1) {
        throw (new Error(`Cannot find subject <${subjName}> within the current account book!`));
    };
};

function sanitize_amount(amount, decimals) {
    // Check if the amount is more precise than the specified decimals
    const precision = Math.pow(10, decimals);
    if (Math.abs(amount * precision) % 1 > 0.0001) {
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
        <td>${bookObj.ram.date}</td>
        <td>${operation}</td>
        <td>${subj1}</td>
        <td style="text-align: right;">${sanitize_amount(amount1, 2)}</td>
        <td>${subj2}</td>
        <td style="text-align: right;">${sanitize_amount(amount2, 2)}</td>
        <td>${comment}</td>
    </tr>`;
}

the_real_constructor.prototype.expand = function (subjA, subjD, amount, comment) {
    if (amount < 0) {
        throw new Error('Always give a positive number for expand amount!')
    };
    require_subject_field(this, subjA, 'A');
    require_subject_field(this, subjD, 'D');
    this.ram.current_balance_sheet.assets[subjA] += amount;
    this.ram.current_balance_sheet.debts[subjD] += amount;
    fix_balance_sheet_dict_float_precision(this);
    print_log_line(this, 'Expand', subjA, subjD, amount, amount, comment);
};
the_real_constructor.prototype.shrink = function (subjA, subjD, amount, comment) {
    if (amount > 0) {
        throw new Error('Always give a negative number for shrink amount!')
    };
    require_subject_field(this, subjA, 'A');
    require_subject_field(this, subjD, 'D');
    this.ram.current_balance_sheet.assets[subjA] += amount;
    this.ram.current_balance_sheet.debts[subjD] += amount;
    fix_balance_sheet_dict_float_precision(this);
    print_log_line(this, 'Shrink', subjA, subjD, amount, amount, comment);
};
the_real_constructor.prototype.transferA = function (from, to, amount, comment) {
    if (amount < 0) {
        throw new Error('Always give a positive number for transfer amount!')
    };
    require_subject_field(this, from, 'A');
    require_subject_field(this, to, 'A');
    this.ram.current_balance_sheet.assets[from] -= amount;
    this.ram.current_balance_sheet.assets[to] += amount;
    fix_balance_sheet_dict_float_precision(this);
    print_log_line(this, 'TransferA', from, to, -amount, amount, comment);
};
the_real_constructor.prototype.transferD = function (from, to, amount, comment) {
    if (amount < 0) {
        throw new Error('Always give a positive number for transfer amount!')
    };
    require_subject_field(this, from, 'D');
    require_subject_field(this, to, 'D');
    this.ram.current_balance_sheet.debts[from] -= amount;
    this.ram.current_balance_sheet.debts[to] += amount;
    fix_balance_sheet_dict_float_precision(this);
    print_log_line(this, 'TransferD', from, to, -amount, amount, comment);
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
    console.log(`<div><strong>Dump Snapshot ${this.ram.date}</strong></div>`);
    dump_formatters[options.format](this.ram.current_balance_sheet)
};

const dump_formatters = {};
dump_formatters.json = function (current_balance_sheet) {
    console.log(`<pre>`);
    console.log(JSON.stringify(current_balance_sheet, '\t', 4))
    console.log(`</pre>`);
};
dump_formatters.html = function (current_balance_sheet) {
    console.log(`<div>`);
    console.log(`<div>
        <strong>Assets</strong>
        <table>
        <tbody>
        ${Object.keys(current_balance_sheet.assets).map(key => `<tr><td>${key}</td><td>${sanitize_amount(clarify_ieee_float(current_balance_sheet.assets[key]), 2)
        }</td></tr>`).join('\n')}
        </tbody>
        </table>
    </div>`);
    console.log(`<div>
        <strong>Debts</strong>
        <table>
        <tbody>
        ${Object.keys(current_balance_sheet.debts).map(key => `<tr><td>${key}</td><td>${sanitize_amount(clarify_ieee_float(current_balance_sheet.debts[key]), 2)
        }</td></tr>`).join('\n')}
        </tbody>
        </table>
    </div>`);
    console.log(`</div>`);
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
            <strong>Cashflow group ${group}</strong><br>
            cash_in ${sanitize_amount(cash_in, 2)}<br>
            cash_in ${sanitize_amount(cash_out, 2)}<br>
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



the_real_constructor.prototype.html_table_footer = function () {
    console.log(`</tbody></table>`);
};
the_real_constructor.prototype.html_table_header = function () {
    console.log(`<table><tbody>`);
    console.log(`<tr>
        <td>Date</td>
        <td>Operation</td>
        <td>Subject 1</td>
        <td>Amount 1 (${this.config.symbol})</td>
        <td>Subject 2</td>
        <td>Amount 2 (${this.config.symbol})</td>
        <td>Comment</td>
    </tr>`);
};







module.exports = {
    create,
    html_tag: function (tag, content) {
        console.log(`<${tag}>${content}</${tag}>`);
    }
}

