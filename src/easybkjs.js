function create(config) {
    return new the_real_constructor(config);
};

function the_real_constructor(config) {
    this.config = config;
    this.config.logFormat = 'html';
    this.ram = {};
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
    if (Math.round(amount * precision) !== amount * precision) {
        throw new Error(`Amount exceeds the specified precision of ${decimals} decimal places.`);
    }

    // Convert the amount to a fixed number of decimal places
    const formattedAmount = amount.toFixed(decimals);

    // Add commas for thousands separators
    const parts = formattedAmount.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    // Add the sign (+ or -) for non-zero amounts
    if (amount !== 0) {
        parts[0] = amount < 0 ? '' + parts[0] : '+' + parts[0];
    }

    // Join the parts and return the formatted amount
    return parts.join('.');
}


function print_log_line(bookObj, operation, subj1, subj2, amount1, amount2, comment) {
    console.log(logline_formaters[bookObj.config.logFormat](bookObj, operation, subj1, subj2, amount1, amount2, comment));
};

const logline_formaters = {};
logline_formaters.html = function (bookObj, operation, subj1, subj2, amount1, amount2, comment) {
    // console.log(bookObj);
    return `<tr>
        <td>${bookObj.ram.date}</td>
        <td>${operation}</td>
        <td>${subj1}</td>
        <td>${sanitize_amount(amount1, 2)}</td>
        <td>${subj2}</td>
        <td>${sanitize_amount(amount2, 2)}</td>
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
    print_log_line(this, 'TransferD', from, to, -amount, amount, comment);
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
        ${Object.keys(current_balance_sheet.assets).map(key => `<tr><td>${key}</td><td>${current_balance_sheet.assets[key]}</td></tr>`).join('\n')}
        </tbody>
        </table>
    </div>`);
    console.log(`<div>
        <strong>Debts</strong>
        <table>
        <tbody>
        ${Object.keys(current_balance_sheet.debts).map(key => `<tr><td>${key}</td><td>${current_balance_sheet.debts[key]}</td></tr>`).join('\n')}
        </tbody>
        </table>
    </div>`);
    console.log(`</div>`);
};



module.exports = {
    create,
    html_table_header: function () {
        console.log(`<table><tbody>`);
        console.log(`<tr>
            <td>Date</td>
            <td>Operation</td>
            <td>Subject 1</td>
            <td>Amount 1</td>
            <td>Subject 2</td>
            <td>Amount 2</td>
            <td>Comment</td>
        </tr>`);
    },
    html_table_footer: function () {
        console.log(`</tbody></table>`);
    },
    html_tag: function (tag, content) {
        console.log(`<${tag}>${content}</${tag}>`);
    }
}

