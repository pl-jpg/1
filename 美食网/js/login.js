$(function() {
    $(".login_false_tip").hide();
    $(".nl_loginbox_w2").hide();
    $(".nl_loginbox_w1").show();
    $(this).addClass("current").siblings().removeClass("current");

    $("#login_phone_tab").click(function() {
        $(".login_false_tip").hide();
        $(".nl_loginbox_w2").hide();
        $(".nl_loginbox_w1").show();
        $(this).addClass("current").siblings().removeClass("current");
    });
    $("#login_acc_tab").click(function() {
        $(".login_false_tip").hide();
        $(".nl_loginbox_w1").hide();
        $(".nl_loginbox_w2").show();
        $(this).addClass("current").siblings().removeClass("current");
    });

    $(".submit").click(function (){
        let username=$("#username").val()
        let password=$(".password").val()
        $.post("login.json",
            function(data){
                var json=data[0];
               if(json.username==username&&json.password==password){
                   window.location.href="index.html";
                }
               else{
                   $(".err").css('display','block');
                   setTimeout(function (){
                       $(".err").css('display','none');
                   },3000)
               }
            }
        )
    });

    $('.golink1').click(function() {
        if ($(this).html() == '更多第三方登录方式') {
            $(this).html('收起');
        } else if ($(this).html() == '收起') {
            $(this).html('更多第三方登录方式');
        }
        $('.nl_moredsf').slideToggle();
    })
})