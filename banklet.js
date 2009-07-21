// Banklet, http://github.com/steffentchr/banklet
// Code for bookmarklet:
// javascript:void(function(){var%20s=document.createElement('script');s.src='http://refresh.dk/bank/banklet.js';document.getElementsByTagName('head')[0].appendChild(s);}())

try {
    // Insert jQuery
    if (!$) {
        var s = document.createElement('script');
        s.src='http://code.jquery.com/jquery-latest.js';
        document.getElementsByTagName('head')[0].appendChild(s);
    }
    
    // Testing stuff
    var data = {success:false, account_name:'', transactions:[]};
    var banks = [
        {
            // Bank: Jyske Bank, http://www.jyskenetbank.dk, 
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
                            var date = $(values.get(2)).text().trim();
                            if (date.length==0) return;
                            var text = $(values.get(3)).text().trim();
                            var change = $(values.get(5)).text().trim().replace(/\./img, '').replace(/,/img, '.');
                            var total = $(values.get(6)).text().trim().replace(/\./img, '').replace(/,/img, '.');
                            tx.push({date:date, text:text, change:change, total:total});
                        }
                    });
                return(tx);
            }
        }
      ];

    $.each(banks, function(){
            if(this.test_bank()) {
                // Right bank
                if(this.test_page()) {
                    data = {account_name:this.account_name, success:true, transactions:this.transactions()};
                } else {
                    alert('Not right page for ' + this.bank_name);
                }
                return(false);
            }
        });
    if (data.success) {
    } else {
        alert('Nothing known about this bank or webpage.');
    }
} catch(e) {alert(e);}


