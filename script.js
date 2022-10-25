var nombreTentatives = 0;

var historiqueTentatives = [];

var lengthCheck = setInterval(checkForWordChange, 10000);

var LONGUEUR = getWordLength().then(function(data){
    
    LONGUEUR = data.longueur

    $("#nombreCaracteres").text(LONGUEUR);

    $("#nombreTentativesRestantes").text("7");

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

                            $("#btnValider").text("Bravo !").removeClass("btn-primary").addClass("btn-success").prop("disabled",true);
        
                            await(setTimeout(function(){

                                var emojisTentatives = generateShareString(historiqueTentatives);

                                console.log(emojisTentatives)
                        
                                $("#affichage").append(`
                                <div class='felicitations col-md-6 col-sm-8 mt-4 mb-2 px-4 d-flex flex-column align-items-center text-center' id='félicitations'>
                                    <p class="fs-2 text-success mt-2 mb-2 fw-light btn-outline-success">Félicitations !</p>
                                    <p class="fs-4 text-light fw-light">Vous avez trouvé le mot : ${mot} en <span class="fw-bold">${nombreTentatives}</span> tentatives !</p>
                                    <p class="fs-4 text-light fw-light">Revenez demain pour essayer avec un nouveau mot ! :3</p>
                                    <a class="twitter-share-button" href="https://twitter.com/intent/tweet?text=${emojisTentatives.toString()}" data-size="large"><button class="btn btn-outline-primary mb-2">Tweeter !</button></a>
                                </div>
                                `);
        
                            },3000))
                        }
                        else if(nombreTentatives >= 7)
                        {
                            $("#btnValider").text("Dommage :/").removeClass("btn-primary").addClass("btn-danger").prop("disabled",true);
        
                            setTimeout(function(){

                                var shareString = generateShareString(historiqueTentatives);

                                console.log("sharestring: ",shareString.toString().replace(",","%0a"))
                        
                                $("#affichage").append(`
                                <div class='banned col-md-6 col-sm-8 mt-4 mb-3 px-4 d-flex flex-column align-items-center text-center' id='dommage'>
                                    <p class="fs-2 text-danger mt-2 mb-2 fw-light btn-outline-danger">Dommage !</p>
                                    <p class="fs-4 text-light fw-light">Vous n'avez pas réussi à trouver le mot...</p>
                                    <p class="fs-4 text-light fw-light">Revenez demain pour essayer avec un nouveau mot, vous aurez peut-être plus de chance ! :3</p>
                                    <a class="twitter-share-button" href="https://twitter.com/intent/tweet?text=${shareString.toString().replace(",","%0a")}" data-size="large"><button class="btn btn-outline-primary mb-2">Tweeter !</button></a>
                                </div>
                                `);
        
                            },1000)
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

    try
    {
        $.ajax({
            url:'https://nique.freeboxos.fr/ajax-word-length',
            method:'GET',
            dataType:'jsonp',
            crossDomain:true,
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
    }
    catch(xhr)
    {
        errorHandler(xhr)
    }
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

    $('#nombreTentativesRestantes').text(7-nombreTentatives);

    historiqueTentatives.push(difference);

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
    console.log(xhr)
    if(xhr.status == 429)
    {
        if($("#affichageErreur").length == 1)
        {
            console.log("inside")
            $("#affichageErreur").html(`
            <div class='banned col-md-6 col-sm-8 mt-4 mb-2 d-flex flex-column align-items-center text-center' id='divErreur'>
                <p class="fs-4 text-danger mt-2 mb-2 mx-4 fw-light">Suite à un trop grand nombres de requêtes, votre IP à été bannie pour une minute.</p>
            </div>
            `);    
        }
    }
}

function generateShareString(histo)
{

    let date = new Date(Date.now())
    let final = "";

    if(nombreTentatives >= 7)
    {
        nombreTentatives = String.fromCodePoint(128532) // Pensive face
    }

    final +=(`Mot du ${date.getDate()}-${date.getMonth()}-${date.getFullYear()} %7C ${nombreTentatives}%2f7%0a%0a`)

    for(i=0;i<histo.length;i++)
    {
        var tentative = histo[i];
        
        var ligne = ""

        if(tentative === "success")
        {
            ligne += String.fromCodePoint(128994).repeat(LONGUEUR) // Rond vert sur toute la longueur
        }
        else
        {
            for(x=0;x<tentative.length;x++)
            {
                var lettre = tentative[x];

                if(lettre === "_")
                {
                    ligne += String.fromCodePoint(128308) // Rond rouge
                }
                else if(lettre === "*")
                (
                    ligne += String.fromCodePoint(128992) // Rond orange
                )
                else
                {
                    ligne += String.fromCodePoint(128994) // Rond vert
                }
            }
    
        }
        final += ligne+"%0a";
    }


    final += ('%0ahttps://raidette.github.io/YetAnotherWordleClone/%0a')

    console.log("final :",final)
    return final;
}


