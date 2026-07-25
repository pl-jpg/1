$(function (){
    $(".submit").click(function (){
        let username = $(".username").val()
        let email = $(".email").val()
        let comment = $(".comment").val()

        if(username==''){
            return true
        }else if(email==''){
            return true
        }else if(comment==''){
            return true
        }else {
            $(".three-com").append(
                "                    <div class=\"tom-grid humour\" style=\"border-top: 1px solid #ddd;border-bottom: none\">\n" +
                "                    <div class=\"tom\">\n" +
                "                        <img src=\"../../images/co.png\" alt=\" \" />\n" +
                "                    </div>\n" +
                "                    <div class=\"tom-right\">\n" +
                "                        <div class=\"Hardy\">\n" +
                "                            <h4>"+username+"</h4>\n" +
                "                            <p><label>2024.7.3</label></p>\n" +
                "                        </div>\n" +
                "                        <div class=\"reply\">\n" +
                "                            <a href=\"#\">回复</a>\n" +
                "                        </div>\n" +
                "                        <div class=\"clearfix\"> </div>\n" +
                "                        <p class=\"lorem\">"+comment+"</p>\n" +
                "                    </div>\n" +
                "                    <div class=\"clearfix\"> </div>\n" +
                "                </div>");
        }
    })
})