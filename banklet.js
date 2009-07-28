// Banklet, http://github.com/steffentchr/banklet
// Code for bookmarklet:
// javascript:void(function(){var%20s=document.createElement('script');s.src='http://bank.labs.refresh.dk/resources/banklet/banklet.js';document.getElementsByTagName('head')[0].appendChild(s);}())

// Insert jQuery
var s2 = document.createElement('script');
s2.src='http://bank.labs.refresh.dk/resources/jquery/jquery.js';
document.getElementsByTagName('head')[0].appendChild(s2);

try {
    // Testing stuff
    var data = {bank_name:'', account_name:'', transactions:[]};
    var banks = [
        {
            // Bank: Jyske Bank, http://www.jyskenetbank.dk
            // Maintainer: steffen@refresh.dk
            bank_name: function(){return('Jyske Bank');},
            currency: function(){return('DKK');},
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
                            var amount = $(values.get(5)).text().trim().replace(/\./img, '').replace(/,/img, '.'); // float number
                            var total = $(values.get(6)).text().trim().replace(/\./img, '').replace(/,/img, '.'); // float number
                            if (date.length==0 || text.length==0 || amount.length==0 || total.length==0) return;
                            tx.push({date:date, text:text, amount:amount, total:total});
                        }
                    });
                return(tx);
            }
        },
        {
            // Bank: Nordea, http://www.netbank.nordea.dk
            // Maintainer: steffen@refresh.dk
            bank_name: function(){return('Nordea');},
            currency: function(){return('DKK');},
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
                            var amount = $(values.get(4)).text().trim().replace(/[^0-9\-,\.]/img, '').replace(/\./img, '').replace(/,/img, '.'); // float number
                            var total = $(values.get(6)).text().trim().replace(/[^0-9\-,\.]/img, '').replace(/\./img, '').replace(/,/img, '.'); // float number
                            if (date.length==0 || text.length==0 || amount.length==0 || total.length==0) return;
                            tx.push({date:date, text:text, amount:amount, total:total});
                        }
                    });
                return(tx);
            }
        },
        {
            // Bank: BEC (Eik Bank, ....), http://www.bec.dk
            // Maintainer: steffen@refresh.dk
            bank_name: function(){return('BEC');},
            currency: function(){return('DKK');},
            test_bank: function(){
                if ($("frame[name='main']").length) {
                    // BEC is tricky since the user's bank is embedding the web bank service in a frame from a different service domain.
                    // This means that we won't have access to the dom in the content frame -- simply because we don't have access to the domain
                    // Instead, we'll need to the user to open up the frame in
                    f = $("frame[name='main']").get(0);
                    if (f && new RegExp('bec.dk').test(f.src)) {
                        alert("Du bruger " + $('title').text() + ", som er en netbank fra BEC.\n\nFor at hente data ud med banklet, skal du højreklikke på tabellen med posteringer, vælge menupunktet 'Denne ramme' efterfulgt af 'Vis kun denne ramme'.\n\nSkærmbilledet skifter nu, og du vil derefter muligvis blive bedt om at logge ind igen. Når du igen ser listen over posteringer, kan du trykke på denne importeringsknap igen.");
                        return(false);
                    }
                }
                return($('body div.inetcontent div.timestamp').length>0);
            },
            test_page: function(){return($('body#Posteringer table.datatable tr.odd').length>0);},
            account_name: function(){
                var account_name = '';
                $($('select').get(0).options).each(function(){
                        if(this.selected) {
                            var _v = this.value;
                            var _l = this.innerHTML.replace(/\&nbsp;/img, ' ');
                            var _i = _l.indexOf(_v);
                            account_name = _l.substring(0,_i-1);
                        }
                    });
                return(account_name);
            },
            transactions: function(){
                var items = $('body#Posteringer table.datatable tr.odd, body#Posteringer table.datatable tr.even');
                var tx = [];
                $.each(items, function(){
                        var values = $(this).find('td');
                        if (values.size()==7) {
                            var _date = $(values.get(0)).text().trim();
                            if (_date.length==0) return;
                            var arr_date = _date.match(/(\d{2})\.(\d{2})\.(\d{4})/);
                            var date = arr_date[3] + '-' + arr_date[2] + '-' + arr_date[1]; // Date as 2009-07-21
                            var text = $(values.get(2)).text().replace(/\t/img, '').trim(); // text
                            var amount = $(values.get(4)).text().trim().replace(/[^0-9\-,\.]/img, '').replace(/\./img, '').replace(/,/img, '.'); // float number
                            var total = $(values.get(5)).text().trim().replace(/[^0-9\-,\.]/img, '').replace(/\./img, '').replace(/,/img, '.'); // float number
                            if (date.length==0 || text.length==0 || amount.length==0 || total.length==0) return;
                            tx.push({date:date, text:text, amount:amount, total:total});
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
                    data = {currency:this.currency(), account_name:this.account_name(), bank_name:this.bank_name(), transactions:this.transactions()};
                    success = true;
                    //console.debug(data);
                } else {
                    alert('Not right page for ' + this.bank_name());
                }
                return(false);
            }
        });
    if (match) {
        if (success) {
            var f = document.createElement('form');
            f.setAttribute('action', 'http://bank.labs.refresh.dk/bank/import');
            f.setAttribute('method', 'post');
            f.setAttribute('target', '_new');

            var account_name_input = document.createElement('input');
            account_name_input.setAttribute('type', 'hidden');
            account_name_input.setAttribute('name', 'account_name');
            account_name_input.setAttribute('value', data.account_name);
            f.appendChild(account_name_input);

            var currency_input = document.createElement('input');
            currency_input.setAttribute('type', 'hidden');
            currency_input.setAttribute('name', 'currency');
            currency_input.setAttribute('value', data.currency);
            f.appendChild(currency_input);

            var bank_name_input = document.createElement('input');
            bank_name_input.setAttribute('type', 'hidden');
            bank_name_input.setAttribute('name', 'bank_name');
            bank_name_input.setAttribute('value', data.bank_name);
            f.appendChild(bank_name_input);

            $.each(data.transactions, function(i,tx){
                    var date_input = document.createElement('input');
                    date_input.setAttribute('type', 'hidden');
                    date_input.setAttribute('name', 'date'+i);
                    date_input.setAttribute('value', tx.date);
                    f.appendChild(date_input);

                    var text_input = document.createElement('input');
                    text_input.setAttribute('type', 'hidden');
                    text_input.setAttribute('name', 'text'+i);
                    text_input.setAttribute('value', tx.text);
                    f.appendChild(text_input);

                    var amount_input = document.createElement('input');
                    amount_input.setAttribute('type', 'hidden');
                    amount_input.setAttribute('name', 'amount'+i);
                    amount_input.setAttribute('value', tx.amount);
                    f.appendChild(amount_input);

                    var total_input = document.createElement('input');
                    total_input.setAttribute('type', 'hidden');
                    total_input.setAttribute('name', 'total'+i);
                    total_input.setAttribute('value', tx.total);
                    f.appendChild(total_input);
                });

            document.body.appendChild(f);
            f.submit();
        }
    } else {
        alert('Nothing known about this bank or webpage.');
    }
} catch(e) {alert(e);}


