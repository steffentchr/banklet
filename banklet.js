// Banklet, http://github.com/steffentchr/banklet
// Code for bookmarklet:
// javascript:void(function(){var%20s=document.createElement('script');s.src='http://refresh.dk/bank/banklet.js';document.getElementsByTagName('head')[0].appendChild(s);}())

// Insert jQuery
var s = document.createElement('script');
s.src='http://code.jquery.com/jquery-latest.js';
document.getElementsByTagName('head')[0].appendChild(s);

try {
    // Testing stuff
    var data = {success:false, account_name:'', transactions:[]};
    var banks = [
        {
            // Bank: Jyske Bank, http://www.jyskenetbank.dk
            // Maintainer: steffen@refresh.dk
            bank_name: 'Jyske Bank',
            _doc: function(){if($('#main').length && $('#main').get(0).contentDocument) return($('#main').get(0).contentDocument); else return(null);},
            test_bank: function(){var d=this._doc(); return(d && new RegExp('JyskeNetbank').test($('frameset').get(0).innerHTML));},
            test_page: function(){var d=this._doc(); return($(d).find('table.DataTable tr td').length>0);},
            account_name: function(){
                var account_name = '';
                $($(this._doc()).find('select').get(0).options).each(function(){
                        if(this.selected) account_name = this.innerHTML.substring(14);
                    });
                return(account_name);
            },
            transactions: function(){
                var items = $(this._doc()).find('table.DataTable tbody tr');
                var tx = [];
                $.each(items, function(){
                        var values = $(this).find('td');
                        if (values.size()==7) {
                            var _date = $(values.get(2)).text().trim();
                            if (_date.length==0) return;
                            var arr_date = _date.match(/(\d{2})\.(\d{2})\.(\d{4})/);
                            var date = arr_date[3] + '-' + arr_date[2] + '-' + arr_date[1];  // Date as 2009-07-21
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
            _doc:function(){var ret; $('frame').each(function(){if ($(this).attr('name').indexOf('content')==0) ret=this.contentDocument;}); return(ret);},
            test_bank: function(){var d = this._doc(); return(d && $(d).find('body.ContentBGcolor').length);},
            test_page: function(){var d = this._doc(); return(d && $(d).find('body.ContentBGcolor table.LeftmenuFaneQuickFix tr.tableBody').length);},
            account_name: function(){
                var account_name = '';
                $($(this._doc()).find('select').get(0).options).each(function(){
                        if(this.selected) account_name = this.innerHTML.substring(0,this.innerHTML.length-13);
                    });
                return(account_name);
            },
            transactions: function(){
                var items = $(this._doc()).find('table.LeftmenuFaneQuickFix tr.tableBody, table.LeftmenuFaneQuickFix tr.tableBodywhite');
                var tx = [];
                $.each(items, function(){
                        var values = $(this).find('td');
                        if (values.size()==8) {
                            var _date = $(values.get(1)).text().trim();
                            if (_date.length==0) return;
                            var arr_date = _date.match(/(\d{2})-(\d{2})-(\d{4})/);
                            var date = arr_date[3] + '-' + arr_date[2] + '-' + arr_date[1]; // Date as 2009-07-21
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
    var success = false;          
    $.each(banks, function(){
            if(this.test_bank()) {
                match = true;
                // Right bank
                if(this.test_page()) {
                    data = {account_name:this.account_name(), bank_name:this.bank_name, transactions:this.transactions()};
                    success = true;
                    console.debug(data);
                } else {
                    console.debug('Not right page for ' + this.bank_name);
                }
                return(false);
            }
        });
    if (match) {
        if (success) {}
    } else {
        console.debug('Nothing known about this bank or webpage.');
    }
} catch(e) {console.debug(e);}


