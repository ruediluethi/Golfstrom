clear;
close all;

a = 1;
b = 1;
c = 1;



hold on;
variation_list = linspace(-1,3,9);
for variation = variation_list
    alpha = 1;
    beta = variation;
    gamma = 0.2;

    g = @(q) alpha.*(1./(1+abs(q))) - beta.*(gamma./(gamma+abs(q)));

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
    
    plot(q,g(q),line_color,'DisplayName',['\beta = ',num2str(variation)]);
end
plot(q,q,'Color',[.8 .8 .8],'DisplayName',['Achsenhalbierende']);
axis([-1 1 -2 2]);
legend('boxoff');
legend('Location','southwest');
%legend('Location','northoutside');
legend('show');
xlabel('q');
ylabel('g(q)');

fig = gcf;
fig.PaperUnits = 'centimeters';
fig.PaperPosition = [0 0 10 10];
print(['../Diagramme/g_von_q.png'],'-dpng','-r300');

