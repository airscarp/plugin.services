var service = {
    
    service_detail_loading : '<div>Loading...</div>',
    

    services : function(func){

        if(func === undefined) return false;        
        var cmd = "systemctl -r --type service --all";
    
        airscarp.plugin.shell.exec(cmd, function(x){
            
            if(!x.s){
                airscarp.error();
                return false;
            }
            
            func(x.output);
        });
    },
    
    
    //Table
    table : function(){
        service.services(function(data){
            
            var lines, cols, tbody, switch_button, service_name, checked;
            
            // Lines
            lines = data.replace(/●/g, "").split("\n");
            lines.shift();
            
            tbody = [];
            
            // Each line
            for(var i = 0; i < lines.length; i++){
                
                // End of table
                if(!lines[i] || lines[i] === "" || lines[i] === undefined) break;
                
                // Columns
                cols = $.trim(lines[i]).replace(/ +/g, " ").split(" ");
                
                // Service Checked
                checked = cols[2].toLowerCase() == "active" ? "checked" : "";
            
                // Switch Button
                switch_button = [
                '<div data-switch-btn="' + cols[0] + '">',
                    '<label class="switch sm">',
                        '<input type="checkbox" value="1" ' + checked + ' data-service="' + cols[0] + '" class="service-status-switch">',
                        '<span class="slider"></span>',
                    '</label>',
                    '<i class="fas fa-circle-notch fa-spin"></i>',
                '</div>',
                ].join("");
                
                // Table Data
                tbody.push([
                    '<tr>',
                        '<td>' + switch_button + '</td>',
                        '<td>' + cols[0].replace(/\.service$/g, "") + '</td>',
                        '<td>' + cols[1] + '</td>',
                        '<td>' + cols[2] + '</td>',
                        '<td>' + cols[3] + '</td>',
                        '<td>' + cols.splice(4).join(" ") + '</td>',
                        '<td><a href="#" data-toggle-service-details="' + cols[0] + '" class="ml-2" data-placement="left" data-toggle="tooltip" title="Details"><i class="fas fa-chevron-down"></i></a></td>',
                    '</tr>',
                    '<tr data-service-details="' + cols[0] + '">',
                        '<td colspan="7"></td>',
                    '</tr>',
                ]);
            }
            
            // Show Table
            $("#services-table tbody").html(tbody.join(""));
            
        });
    },
    
    // Loading
    loading : {
        
        switch : {
            
            show : function(service_name){
                $("[data-switch-btn='" + service_name + "'] label").hide();
                $("[data-switch-btn='" + service_name + "'] svg").show();
            },
            
            hide : function(service_name){
                $("[data-switch-btn='" + service_name + "'] label").show();
                $("[data-switch-btn='" + service_name + "'] svg").hide();
            },
        },
    },
    
    start : function(name){
        
        service.loading.switch.show(name);
        airscarp.plugin.shell.exec("sudo systemctl start " + name, function(x){
            
            if(x.s){
                airscarp.success("Service started!");
                service.loading.switch.hide(name);
            }
            else{
                airscarp.error();
                service.loading.switch.hide(name);
            }
        });
    },
    
    stop : function(name){
        
        service.loading.switch.show(name);
        airscarp.plugin.shell.exec("sudo systemctl stop " + name, function(x){
            
            if(x.s){
                airscarp.success("Service stopped!");
                service.loading.switch.hide(name);
            }
            else{
                airscarp.error();
                service.loading.switch.hide(name);
            }
        });
    },
    
    restart : function(){},
    reload : function(){},
    
    
    listeners : {
        
        toggle : function(){
        
            $(document).on("change", ".service-status-switch", function(e){
                
                e.preventDefault();
                
                var name = $(this).attr("data-service");
                
                // Start
                if($(this).prop("checked")) service.start(name);
                
                // Stop
                else service.stop(name);
            });
        },
        
        service_details : function(){
            
            $(document).on("click", "[data-toggle-service-details]", function(e){
                
                e.preventDefault();
                
                var name = $(this).attr("data-toggle-service-details");
                if(name === undefined) airscarp.error(); else{
                    
                    $(this).toggleClass("active");
                    $("[data-service-details='" + name + "']").toggle();
                }
            });
        }
    },
    
};

// Listeners
service.listeners.toggle();
service.listeners.service_details();