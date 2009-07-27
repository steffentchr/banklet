// Banklet, http://github.com/steffentchr/banklet
// Code for bookmarklet:
// javascript:void(function(){var%20s=document.createElement('script');s.src='http://refresh.dk/bank/banklet.js';document.getElementsByTagName('head')[0].appendChild(s);}())

// Insert jQuery
if (!$) {
    var s = document.createElement('script');
    s.src='http://code.jquery.com/jquery-latest.js';
    document.getElementsByTagName('head')[0].appendChild(s);
}

try {
    // Testing stuff
    var data = {success:false, account_name:'', transactions:[]};
    var banks = [
        {
            // Bank: Jyske Bank, http://www.jyskenetbank.dk
            // Maintainer: steffen@refresh.dk
            bank_name: 'Jyske Bank',
            test_bank: function(){return($('#main').length && $('#main').get(0).contentDocument && ('#main').get(0).contentDocument.documentElement && new RegExp('JyskeNetbank').test($('frameset').get(0).innerHTML));},
            test_page: function(){return($($('#main')[0].contentDocument.documentElement).find('table.DataTable tr td').length>0);},
            transactions: function(){
                var items = $($('#main').get(0).contentDocument.documentElement).find('table.DataTable tbody tr');
                var tx = [];
                $.each(items, function(){
                        var values = $(this).find('td');
                        if (values.size()==7) {
                            var date = $(values.get(2)).text().trim(); // Date as 2009-07-21
                            if (date.length==0) return;
                            var text = $(values.get(3)).text().trim(); // text
                            var change = $(values.get(5)).text().trim().replace(/\./img, '').replace(/,/img, '.'); // float number
                            var total = $(values.get(6)).text().trim().replace(/\./img, '').replace(/,/img, '.'); // float number
                            tx.push({date:date, text:text, change:change, total:total});
                        }
                    });
                return(tx);
            }
        },
        {
            // Bank: Nordea, http://www.netbank.nordea.dk
            // Maintainer: steffen@refresh.dk
            bank_name: 'Nordea',
            _frame:function(){var ret; $('frame').each(function(){if ($(this).attr('name').indexOf('content')==0) ret=this;}); return(ret);},
            test_bank: function(){var f = this._frame(); return(f && f.contentDocument && $(f.contentDocument).find('body.ContentBGcolor').length);},
            test_page: function(){var f = this._frame(); return(f && f.contentDocument && $(f.contentDocument).find('body.ContentBGcolor table.LeftmenuFaneQuickFix tr.tableBody').length);},
            account_name: function(){
                var f = this._frame(); 
                var account_name = '';
                $($(f.contentDocument).find('select').get(0).options).each(function(){
                        if(this.selected) account_name = this.innerHTML.substring(0,this.innerHTML.length-13);
                    });
                return(account_name);
            },
            transactions: function(){
                var f = this._frame(); 
                var items = $(f.contentDocument).find('table.LeftmenuFaneQuickFix tr.tableBody, table.LeftmenuFaneQuickFix tr.tableBodywhite');
                var tx = [];
                $.each(items, function(){
                        var values = $(this).find('td');
                        if (values.size()==8) {
                            var _date = $(values.get(1)).text().trim(); // Date as 2009-07-21
                            if (_date.length==0) return;
                            var arr_date = _date.match(/(\d{2})-(\d{2})-(\d{4})/);
                            var date = arr_date[3] + '-' + arr_date[2] + '-' + arr_date[1];
                            var text = $(values.get(2)).text().replace(/\t/img, '').trim(); // text
                            var change = $(values.get(4)).text().trim().replace(/[^0-9\-,\.]/img, '').replace(/\./img, '').replace(/,/img, '.'); // float number
                            var total = $(values.get(6)).text().trim().replace(/[^0-9\-,\.]/img, '').replace(/\./img, '').replace(/,/img, '.'); // float number
                            tx.push({date:date, text:text, change:change, total:total});
                        }
                    });
                return(tx);
            }
        }

      ];

    var match = false;          
    $.each(banks, function(){
            if(this.test_bank()) {
                match = true;
                // Right bank
                if(this.test_page()) {
                    data = {account_name:this.account_name(), bank_name:this.bank_name, success:true, transactions:this.transactions()};
                    console.debug(data);
                } else {
                    console.debug('Not right page for ' + this.bank_name);
                }
                return(false);
            }
        });
    if (match) {
        if (data.success) {}
    } else {
        console.debug('Nothing known about this bank or webpage.');
    }
} catch(e) {alert(e);}


