var nombreTentatives = 0;

var lengthCheck = setInterval(checkForWordChange, 10000);

var LONGUEUR = getWordLength().then(function(data){
    
    LONGUEUR = data.longueur

    $("#nombreCaracteres").text(LONGUEUR);

    $("#inputMot").prop("pattern",".{"+LONGUEUR+"}")


    var FIRST_LETTER = getFirstLetter().then(function(data){

        FIRST_LETTER = data.firstLetter;

        $("#inputMot").prop("title","Le mot doit être long de "+LONGUEUR+" caractères.")
    
        $("#premiereLettre").text(FIRST_LETTER);

        $("#formMot").on("submit", function(){

            event.preventDefault();
        
            var mot = $('#inputMot').val();
        
            $.ajax({
                url:'https://nique.freeboxos.fr/ajax-validate-word',
                crossDomain:true,
                type:'POST',
                dataType:'json',
                data: {
                    mot:mot,
                },
                success: async function(res){
        
                    //console.log(res)
        
                    console.log(res.result)
        
                    $("#inputMot").val(""); // Vide le textfield et remet l'initiale
        
                    if(res.result === "notFound")
                    {
                        console.log("erreur")
        
                        $("#affichageErreur").html(`
                        <div class='error col-md-6 col-sm-8 mt-4 mb-2 d-flex flex-column align-items-center text-center' id='divErreur'>
                            <p class="fs-4 text-warning mt-2 mb-2 mx-4 fw-light">Ce mot n'est pas dans la liste :/</p>
                        </div>
                        `);
        
                        let wait = await(setTimeout(function(){$("#affichageErreur").empty();},7000))
                    }
        
                    else
                    {
                        affichageResultats(LONGUEUR,mot,res.result)
        
                        console.log(nombreTentatives)
            
                        if(res.result === "success")
                        {
                            $("#tentative:last-child").addClass("success");
        
                            await(setTimeout(function(){
        
                                $("#btnValider").text("Bravo !").removeClass("btn-primary").addClass("btn-success").prop("disabled",true);
                
                                $("#affichage").append(`
                                <div class='felicitations col-md-6 col-sm-8 mt-4 mb-2 px-4 d-flex flex-column align-items-center text-center' id='félicitations'>
                                    <p class="fs-2 text-success mt-2 mb-2 fw-light btn-outline-success">Félicitations !</p>
                                    <p class="fs-4 text-light fw-light">Vous avez trouvé le mot : ${mot} en <span class="fw-bold">${nombreTentatives}</span> tentatives !</p>
                                    <p class="fs-4 text-light fw-light">Revenez demain pour essayer avec un nouveau mot ! :3</p>
                                </div>
                                `);
        
                            },3000))
                        }    
                    }
        
                },
                error:function(xhr){
                    errorHandler(xhr)
                }
            });
        })
    
    });
});

async function getWordLength(){

    return $.ajax({
        url:'https://nique.freeboxos.fr/ajax-word-length',
        method:'GET',
        dataType:'jsonp',
        contentType:"application/JSON",    
        success:function(res){
            result = res;
        },
        error:function(xhr){
            errorHandler(xhr)
        }
    });
}

function checkForWordChange(){

    $.ajax({
        url:'https://nique.freeboxos.fr:443/ajax-word-length',
        method:'GET',
        dataType:'jsonp',
        contentType:"application/JSON",    
        success:function(res){
            console.log("longueur check : ",res.longueur);

            if(LONGUEUR != res.longueur)
            {
                window.location.reload();
            }

            console.log(res)
        },
        error:function(xhr){
            errorHandler(xhr)
        }
    });
};

async function getFirstLetter(){

    return $.ajax({
        url:'https://nique.freeboxos.fr/ajax-first-letter',
        method:'GET',
        dataType:'jsonp',
        async:false,
        contentType:"application/JSON",    
        success:function(res){
            result = res
        },
        error:function(xhr){
            errorHandler(xhr)
        }
    });
};

function affichageResultats(len,mot,difference)
{

    nombreTentatives+=1;

    let finalString = "";
    let classe = ""

    for(i=0;i<len;i++)
    {
        if(difference[i] == "_") classe="text-danger"

        else if(difference[i] == "*") classe="text-warning"

        else classe="text-success"

        finalString += "<div class='d-flex align-items-center justify-content-center essai' style='width:"+100/len+"%'><p class='"+classe+"' style='font-size:clamp(10px,4vw,5vw)'>"+mot[i]+"</p></div>"
    }

    $("#affichageResultats").append("<div id='tentative' class='mb-2 w-100 d-flex flex-row align-items-center justify-content-center'>"+finalString+"</div>")
}


function errorHandler(xhr)
{
    if(xhr.status == 420)
    {
        if(!$("#divErreur").length)
        {
            $("#affichageErreur").html(`
            <div class='banned col-md-6 col-sm-8 mt-4 mb-2 d-flex flex-column align-items-center text-center' id='divErreur'>
                <p class="fs-4 text-danger mt-2 mb-2 mx-4 fw-light">Suite à un trop grand nombres de requêtes, votre IP à été bannie pour une heure.</p>
            </div>
            `);    
        }
    }
}


