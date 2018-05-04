clear;
close all;

hold on;
for a = [1:0.1:3]
    alpha = 1.5;
    beta = 1;
    gamma = 1/a;

    g = @(q) alpha.*(1./(1+abs(q))) - beta.*(gamma./(gamma+abs(q)));

    q = linspace(-2,2,1000);

    plot(q,g(q));
end