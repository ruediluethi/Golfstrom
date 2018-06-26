clear;
close all;

% nach Abbildung 13.2 gilt
% für S=33 und T=0 : rho=1027.5
% sei rho nun linear, so muss für rho=1027.5 : S=37, T=30 gelten
% dies führt zu den folgenden zwei Gleichungen:
% rho = rho_0 - b*T1 + c*S1             (1)
% rho = rho_0 - b*T2 + c*S2             (2)
% aus (1): c = 1/S1(rho - rho_0 + b*T1) (3)
% (3) in (2): rho = rho_0 - b*T2 + 1/S1(rho - rho_0 + b*T1)*S2
%             rho = rho_0 - b*T2 + S2/S1(rho - rho_0) + b*T1*S2/S1
%             rho = rho_0 - b(T2 - T1*S2/S1) + S2/S1(rho - rho_0)
%               b = 1/(T2 - T1*S2/S1)( rho_0 - rho - S2/S1(rho_0 - rho) )
%               b = 1/(T2 - T1*S2/S1)(rho_0 - rho)(1 - S2/S1)
rho_0 = 1000;
abbRho = 1027.5;
abbS1 = 33;
abbT1 = 0;
abbS2 = 37;
abbT2 = 30;

b = 1/(abbT2 - abbT1*abbS2/abbS1)*(rho_0 - abbRho)*(1 - abbS2/abbS1)
c = 1/abbS1*(abbRho - rho_0 + b*abbT1)

rho = @(T_i,S_i) rho_0 - b*T_i + c*S_i;

hold on;
rho_start = 1025;
rho_test_sequence = [rho_start:1030];
line_styles = {'-','--','-.',':','-','--','-.',':'};
for rho_i = rho_test_sequence
    line_style = line_styles{rho_i-rho_start+1};
    T_rho = @(S) 1/b*(rho_0 - rho_i + c*S);
    s = [33:37];
    plot(s,T_rho(s),line_style,'Color',[0,0,0],'DisplayName',['\rho = ',num2str(rho_i),' kg/m^3']);
end
axis([33 37 0 30]);
legend('show');
xlabel('Salzgehalt');
ylabel('Temperatur');
%legend('boxoff');
%legend('Location','northoutside');
hold off;

% fig = gcf;
% fig.PaperUnits = 'centimeters';
% fig.PaperPosition = [0 0 10 10];
% print(['../Diagramme/salz_temp_dichte.png'],'-dpng','-r300');
