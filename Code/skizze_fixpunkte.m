clear;
close all;

a = 1;
b = 1;
c = 1;



hold on;
variation_list = linspace(0.2,2,10);
for variation = variation_list
    alpha = variation;
    beta = 1;
    gamma = 0.1;

    g = @(q) alpha.*(1./(1+abs(q))) - beta.*(gamma./(gamma+abs(q)));

    q = linspace(-2,2,1000);

    plot(q,g(q),'DisplayName',[num2str(variation),'a-b=',num2str(alpha-beta)]);
end
legend('show');