clear;
close all;

a = 1;
b = 1;
c = 1;

subplots(1) = subplot(1,2,1);
hold(subplots(1), 'on');

subplots(2) = subplot(1,2,2);
hold(subplots(2), 'on');

%variation_list = linspace(-1,4,10);
variation_list = [-1,-0.6,-0.3,0,0.25,0.5,0.75,1,2,3,4];
for variation = variation_list
    alpha = 1;
    beta = variation;
    gamma = 0.05;

    g = @(q) alpha.*(1./(1+abs(q))) - beta.*(gamma./(gamma+abs(q)));
    k = @(q) (q - g(q)).*(1 + q).*(gamma + q);

    q = linspace(-2,2,1000);
    
    line_color = 'k';
    a_b = ', a-b > 0';
    if (alpha-beta < 0)
        line_color = ':k';
        a_b = ', a-b < 0';
    elseif (beta > 0)
        line_color = '--k';
        a_b = ', a-b < 0';
    end
    
    if (alpha-beta == 0)
        a_b = ', a-b = 0';
    end
    
    plot(subplots(1),q,g(q),line_color,'DisplayName',['\beta = ',num2str(variation)]);
    
    plot(subplots(2),q,k(q),line_color);
end
plot(subplots(1),q,q,'Color',[.8 .8 .8],'DisplayName',['Achsenhalbierende']);
plot(subplots(1),[-1,1],[0,0],'Color',[.8 .8 .8]);
axis(subplots(1),[-1 1 -2 2]);
legend(subplots(1),'boxoff');
legend(subplots(1),'Location','southwest');
legend(subplots(1),'show');
title(subplots(1),'g(q) := \alphaT - \betaS');
xlabel(subplots(1),'q');
ylabel(subplots(1),'g(q)');

plot(subplots(2),[0,1],[0,0],'Color',[.8 .8 .8]);
axis(subplots(2),[0 1 -0.5 0.5]);
title(subplots(2),'k(q) := ( q - g(q) )( 1 + q )( \gamma + q )');
xlabel(subplots(2),'q');
ylabel(subplots(2),'k(q)');

%fig = gcf;
%fig.PaperUnits = 'centimeters';
%fig.PaperPosition = [0 0 10 10];
%print(['../Diagramme/g_von_q.png'],'-dpng','-r300');

