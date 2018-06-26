clear;
close all;

row_count = 3;
cols_count = 3;
line_strength_thin = 1.5;
line_strength_thick = 1.5;

sub_plots = [];
for k = [1:row_count*cols_count]
    sub_plots(end+1) = subplot(row_count,cols_count,k);
    hold(sub_plots(end), 'on');
    %legend(sub_plots(end), 'boxoff');
end

parameter_list = [];
color_list = []; % für die Farbe des Graphen
line_styles = {'-','-','-','--','--','--'};
line_strengths = [line_strength_thin,line_strength_thin,line_strength_thin,line_strength_thick,line_strength_thick,line_strength_thick];

% Behälter 1: Golf von Mexiko
% Behälter 2: Nordmeer
% --> Wasser gefriert zu Eis, Salz wird ausgelöst, höherer Salzgehalt > höhere Dichte
% wenn aber Sstar_02 > Sstar_01, dann Sstar_01 - Sstar_02 < 0
% und damit beta < 0 ...?
% sollten aber alpha und beta nicht jeweils > 0 sein?

% es gibt 6 Fälle:
% alpha > beta > 0: g(0) = alpha - beta > 0 (1)
% beta > alpha > 0: g(0) = alpha - beta < 0 (2)
% alpha > 0 > beta: g(0) = alpha - beta > 0 (3)
% beta > 0 > alpha: g(0) = alpha - beta < 0 (4)
% alpha < beta < 0: g(0) = alpha - beta < 0 (5)
% beta < alpha < 0: g(0) = alpha - beta > 0 (6)

% Fall 1: alpha > beta > 0: g(0) = alpha - beta > 0
n = 1;
color_list = [color_list;[211, 28, 103]]; % Rot
% Umgebung
parameter_list(n,1) = 1;    % Tstar_01: Umgebungstemp. im Behälter 1
parameter_list(n,2) = 0.5;  % Tstar_02: Umgebungstemp. im Behälter 2
parameter_list(n,3) = 1;    % Sstar_01: Salzgehalt der Umgebung im Behälter 1
parameter_list(n,4) = 0.75;  % Sstar_02: Salzgehalt der Umgebung Behälter 2
% Austauschraten
parameter_list(n,5) = 1;    % k_T: Austauschrate für die Temperatur
parameter_list(n,6) = 0.1;  % k_S: Austauschrate für den Salzgehalt
% Proportionalitätskonstanten
parameter_list(n,7) = 1;    % a > 0
parameter_list(n,8) = 1;    % b > 0
parameter_list(n,9) = 1;    % c > 0

% Fall 2: beta > alpha > 0: g(0) = alpha - beta < 0
n = 2;
color_list = [color_list;[20, 178, 57]]; % Grün
% Umgebung
parameter_list(n,1) = 1;    % Tstar_01: Umgebungstemp. im Behälter 1
parameter_list(n,2) = 0.75;  % Tstar_02: Umgebungstemp. im Behälter 2
parameter_list(n,3) = 1;    % Sstar_01: Salzgehalt der Umgebung im Behälter 1
parameter_list(n,4) = 0.5;  % Sstar_02: Salzgehalt der Umgebung Behälter 2
% Austauschraten
parameter_list(n,5) = 1;    % k_T: Austauschrate für die Temperatur
parameter_list(n,6) = 0.1;  % k_S: Austauschrate für den Salzgehalt
% Proportionalitätskonstanten
parameter_list(n,7) = 1;    % a > 0
parameter_list(n,8) = 1;    % b > 0
parameter_list(n,9) = 1;    % c > 0

% Fall 3: alpha > 0 > beta: g(0) = alpha - beta > 0
n = 3;
color_list = [color_list;[224, 78, 14]]; % Orange
% Umgebung
parameter_list(n,1) = 1;    % Tstar_01: Umgebungstemp. im Behälter 1
parameter_list(n,2) = 0.5;  % Tstar_02: Umgebungstemp. im Behälter 2
parameter_list(n,3) = 0.5;    % Sstar_01: Salzgehalt der Umgebung im Behälter 1
parameter_list(n,4) = 1;  % Sstar_02: Salzgehalt der Umgebung Behälter 2
% Austauschraten
parameter_list(n,5) = 1;    % k_T: Austauschrate für die Temperatur
parameter_list(n,6) = 0.1;  % k_S: Austauschrate für den Salzgehalt
% Proportionalitätskonstanten
parameter_list(n,7) = 1;    % a > 0
parameter_list(n,8) = 1;    % b > 0
parameter_list(n,9) = 1;    % c > 0

% Fall 4: beta > 0 > alpha: g(0) = alpha - beta < 0
n = 4;
color_list = [color_list;[226, 175, 12]]; % Gelb
% Umgebung
parameter_list(n,1) = 0.5;    % Tstar_01: Umgebungstemp. im Behälter 1
parameter_list(n,2) = 1;  % Tstar_02: Umgebungstemp. im Behälter 2
parameter_list(n,3) = 1;    % Sstar_01: Salzgehalt der Umgebung im Behälter 1
parameter_list(n,4) = 0.5;  % Sstar_02: Salzgehalt der Umgebung Behälter 2
% Austauschraten
parameter_list(n,5) = 1;    % k_T: Austauschrate für die Temperatur
parameter_list(n,6) = 0.1;  % k_S: Austauschrate für den Salzgehalt
% Proportionalitätskonstanten
parameter_list(n,7) = 1;    % a > 0
parameter_list(n,8) = 1;    % b > 0
parameter_list(n,9) = 1;    % c > 0

% Fall 5: alpha < beta < 0: g(0) = alpha - beta < 0
n = 5;
color_list = [color_list;[214, 88, 221]]; % Lila
% Umgebung
parameter_list(n,1) = 0.5;    % Tstar_01: Umgebungstemp. im Behälter 1
parameter_list(n,2) = 1;  % Tstar_02: Umgebungstemp. im Behälter 2
parameter_list(n,3) = 0.75;    % Sstar_01: Salzgehalt der Umgebung im Behälter 1
parameter_list(n,4) = 1;  % Sstar_02: Salzgehalt der Umgebung Behälter 2
% Austauschraten
parameter_list(n,5) = 1;    % k_T: Austauschrate für die Temperatur
parameter_list(n,6) = 0.1;  % k_S: Austauschrate für den Salzgehalt
% Proportionalitätskonstanten
parameter_list(n,7) = 1;    % a > 0
parameter_list(n,8) = 1;    % b > 0
parameter_list(n,9) = 1;    % c > 0

% Fall 6: beta < alpha < 0: g(0) = alpha - beta > 0
n = 6;
color_list = [color_list;[24, 196, 196]]; % Türkis
% Umgebung
parameter_list(n,1) = 0.75;    % Tstar_01: Umgebungstemp. im Behälter 1
parameter_list(n,2) = 1;  % Tstar_02: Umgebungstemp. im Behälter 2
parameter_list(n,3) = 0.5;    % Sstar_01: Salzgehalt der Umgebung im Behälter 1
parameter_list(n,4) = 1;  % Sstar_02: Salzgehalt der Umgebung Behälter 2
% Austauschraten
parameter_list(n,5) = 1;    % k_T: Austauschrate für die Temperatur
parameter_list(n,6) = 0.1;  % k_S: Austauschrate für den Salzgehalt
% Proportionalitätskonstanten
parameter_list(n,7) = 1;    % a > 0
parameter_list(n,8) = 1;    % b > 0
parameter_list(n,9) = 1;    % c > 0


color_list = color_list./256;
parameter_list_size = size(parameter_list);
%for n = [1:parameter_list_size(1)] % gehe alle Paramter aus parameter_list durch und zeichne das Modell
for n = [3]
    disp(['Fall: ',num2str(n)]);
    
    graph_color = color_list(n,:);
    line_style = line_styles{n};
    line_strength = line_strengths(n);

    %value_shift = 1/(n*10);
    value_shift = 0;
    
    % Anfangsbedingungen
    Tstar_01 = parameter_list(n,1)+value_shift;
    Tstar_02 = parameter_list(n,2)+value_shift;
    Tstar_0  = Tstar_01 - Tstar_02; 

    Sstar_01 = parameter_list(n,3)+value_shift;
    Sstar_02 = parameter_list(n,4)+value_shift;
    Sstar_0  = Sstar_01 - Sstar_02;

    % Austauschraten
    k_T = parameter_list(n,5);
    k_S = parameter_list(n,6);

    % weitere Proportionalitätskonstanten
    a = parameter_list(n,7);
    b = parameter_list(n,8);
    c = parameter_list(n,9);

    % dimensionslose Konstanten
    alpha = 2*(a*b/k_T)*Tstar_0; 
    beta  = 2*(a*c/k_T)*Sstar_0;
    gamma = k_S/k_T;
    disp(['alpha = ',num2str(alpha)]);
    disp(['beta = ',num2str(beta)]);

    % T^*_i(t): Temperatur zum Zeitpunkt t
    Tstar_1 = [Tstar_01];
    Tstar_2 = [Tstar_02];
    Tstar   = [Tstar_0]; % Differenz
    T       = [Tstar(end)/Tstar_0]; % dimensionslose Differenz

    % S^*_i(t): Salzgehalt zum Zeitpunkt t
    Sstar_1 = [Sstar_01];
    Sstar_2 = [Sstar_02];
    Sstar   = [Sstar_0]; % Differenz
    S       = [Sstar(end)/Sstar_0]; % dimensionslose Differenz

    % Zeitschritt dt^*
    dtstar = 0.1;
    dt     = k_T*dtstar; % dimensionslos
    %dt = dtstar;

    % Begin der Simulation
    tstar = [0];
    t     = [0];
    amount_of_iterations = 10;

    % Fluss zum Zeitpunkt t
    Qstar = [];
    Q =     [];

    for i = [1:amount_of_iterations/dtstar]
        % Original Gleichungen
        qstar = a*(b*(Tstar_1(end) - Tstar_2(end)) + c*(Sstar_2(end) - Sstar_1(end)));
        Qstar(end+1) = qstar;

        dTstar_1 = ( k_T*(Tstar_01 - Tstar_1(end)) + abs(qstar)*(Tstar_2(end) - Tstar_1(end)) )*dtstar;
        dTstar_2 = ( k_T*(Tstar_02 - Tstar_2(end)) + abs(qstar)*(Tstar_1(end) - Tstar_2(end)) )*dtstar;

        dSstar_1 = ( k_S*(Sstar_01 - Sstar_1(end)) + abs(qstar)*(Sstar_2(end) - Sstar_1(end)) )*dtstar;
        dSstar_2 = ( k_S*(Sstar_02 - Sstar_2(end)) + abs(qstar)*(Sstar_1(end) - Sstar_2(end)) )*dtstar;

        tstar(end+1) = tstar(end) + dtstar;

        Tstar_1(end+1) = Tstar_1(end) + dTstar_1;
        Tstar_2(end+1) = Tstar_2(end) + dTstar_2;

        Sstar_1(end+1) = Sstar_1(end) + dSstar_1;
        Sstar_2(end+1) = Sstar_2(end) + dSstar_2;

        % Gleichungen für die Differenz
        dTstar = ( k_T*(Tstar_0 - Tstar(end)) - 2*abs(qstar)*Tstar(end) )*dtstar;
        dSstar = ( k_S*(Sstar_0 - Sstar(end)) - 2*abs(qstar)*Sstar(end) )*dtstar;

        Tstar(end+1) = Tstar(end) + dTstar;
        Sstar(end+1) = Sstar(end) + dSstar;

        % dimensionslose Rechnung
        q  = alpha*T(end) - beta*S(end);
        Q(end+1) = q;

        dT = (       (1 - T(end)) - abs(q)*T(end) )*dt;
        dS = ( gamma*(1 - S(end)) - abs(q)*S(end) )*dt;

        t(end+1) = t(end) + dt;
        T(end+1) = T(end) + dT;
        S(end+1) = S(end) + dS;
    end

    % Temperatur
    subplot(row_count,cols_count,1);
    plot(sub_plots(1), tstar, Tstar_1, line_style, 'Color', graph_color, 'LineWidth', line_strength);
    plot(sub_plots(1), tstar, Tstar_2, ':', 'Color', graph_color, 'LineWidth', line_strength);
    title(sub_plots(1), 'Temperatur');
    legend(sub_plots(1), 'T^*_1','T^*_2');

    plot(sub_plots(4), tstar, Tstar, line_style, 'Color', graph_color, 'LineWidth', line_strength);
    plot(sub_plots(4), tstar, Tstar_1-Tstar_2, ':', 'Color', graph_color*0.5);
    legend(sub_plots(4), 'T^*','T^*_1-T^*_2');

    plot(sub_plots(7), t, T, line_style, 'Color', graph_color, 'LineWidth', line_strength)
    plot(sub_plots(7), k_T*tstar, Tstar./Tstar_0, ':', 'Color', graph_color*0.5);
    legend(sub_plots(7), 'T','T^*/T^*_0');
    
    % Salzgehalt
    plot(sub_plots(2), tstar, Sstar_1, line_style, 'Color', graph_color, 'LineWidth', line_strength);
    plot(sub_plots(2), tstar, Sstar_2, ':', 'Color', graph_color, 'LineWidth', line_strength);
    title(sub_plots(2), 'Salzgehalt');
    legend(sub_plots(2), 'S^*_1','S^*_2');

    plot(sub_plots(5), tstar, Sstar, line_style, 'Color', graph_color, 'LineWidth', line_strength);
    plot(sub_plots(5), tstar, Sstar_1-Sstar_2, ':', 'Color', graph_color*0.5);
    legend(sub_plots(5), 'S^*','S^*_1-S^*_2');

    plot1 = plot(sub_plots(8), t, S, line_style, 'Color', graph_color, 'LineWidth', line_strength);
    plot(sub_plots(8), k_T*tstar, Sstar./Sstar_0, ':', 'Color', graph_color*0.5);
    legend(sub_plots(8), 'S','S^*/S^*_0');

    % Fluss
    t = t(1:end-1);

    plot(sub_plots(3), t, Q, line_style, 'Color', graph_color, 'LineWidth', line_strength);
    plot(sub_plots(3), t, (Qstar/k_T)*2, ':', 'Color', graph_color*0.5);
    title(sub_plots(3), 'Fluss');
    legend(sub_plots(3), 'q','2 q^*/k_T');

    % Gleichgewichtsuntersuchung
    g = @(q) alpha.*(1./(1+abs(q))) - beta.*(gamma./(gamma+abs(q)));
    q = linspace(-1,1,1000);
    
    disp(['g(0) = alpha - beta = ',num2str(g(0))]);

    plot(sub_plots(6), q, g(q), line_style, 'Color', graph_color, 'LineWidth', line_strength);
    plot(sub_plots(6), q, q, 'k'); % Achsenhalbierende
    plot(sub_plots(6), [min(q),max(q)],[0,0],':k'); % x-Achse
    plot(sub_plots(6), [0,0],[min(g(q))*2,max(g(q))*2],':k'); % y-Achse
    %axis(sub_plots(6), [min(q) max(q) min(g(q))*2 max(g(q))*2]);
    axis(sub_plots(6), [min(q) max(q) -2 2]);
    %title({['alpha=',num2str(alpha),', beta=',num2str(beta),', gamma=',num2str(gamma)],['g(0)=alpha-beta=',num2str(alpha-beta),' < 0']});
    legend(sub_plots(6), 'hide');
    xlabel(sub_plots(6), 'q');
    ylabel(sub_plots(6), 'g(q)');

    % k(q)
    k = @(q) (q - g(q)).*(1+q).*(gamma+q);
   
    plot(sub_plots(9), q, k(q), 'Color', graph_color, 'LineWidth', line_strength);
    plot(sub_plots(9), [-1,1], [0,0], ':k'); % x-Achse
    %axis(sub_plots(9), [0 max(q) min(k(q))*2 max(k(q))]);
    axis(sub_plots(9), [min(q) max(q) -1 2]);
    legend(sub_plots(9), 'hide');
    xlabel(sub_plots(9), 'q');
    ylabel(sub_plots(9), 'k(q)');

end
