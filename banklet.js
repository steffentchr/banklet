// Banklet, http://github.com/steffentchr/banklet
// Code for bookmarklet:
// javascript:void(function(){var%20s=document.createElement('script');s.src='http://refresh.dk/bank/banklet.js';document.getElementsByTagName('head')[0].appendChild(s);}())

// Insert jQuery
var s2 = document.createElement('script');
s2.src='http://code.jquery.com/jquery-latest.js';
document.getElementsByTagName('head')[0].appendChild(s2);

try {
    // Testing stuff
    var data = {bank_name:'', account_name:'', transactions:[]};
    var banks = [
        {
            // Bank: Jyske Bank, http://www.jyskenetbank.dk
            // Maintainer: steffen@refresh.dk
            bank_name: function(){return('Jyske Bank');},
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
                    data = {account_name:this.account_name(), bank_name:this.bank_name(), transactions:this.transactions()};
                    success = true;
                    console.debug(data);
                } else {
                    console.debug('Not right page for ' + this.bank_name());
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


